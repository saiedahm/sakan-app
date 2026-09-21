"""Sakan payments: real Stripe checkout + backend-owned premium entitlement.

Purchase path (documented in .atoms/PROGRESS.md):
- Frontend entry: /subscription page (plan cards) and landing/pricing CTA.
- POST /api/v1/sakan/payments/create_payment_session {plan_code, success_url, cancel_url}
  -> backend loads the plan from the Plans table (authoritative pricing),
     creates a pending Payment row, creates a Stripe Checkout session
     (async API), persists the session id, returns the hosted checkout URL.
- Frontend opens the URL via client.utils.openUrl; Stripe collects payment.
- Success route (/subscription?session_id=...) calls
  POST /api/v1/sakan/payments/verify_payment {session_id}
  -> backend retrieves the session from Stripe, verifies ownership/amount,
     marks the Payment paid and extends Profiles.premium_until.
The frontend never decides payment success by itself.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import stripe
from core.config import settings
from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Request
from models.Payments import Payments
from models.Plans import Plans
from models.Profiles import Profiles
from models.Promotions import Promotions
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sakan/payments", tags=["sakan-payments"])

# The 99-cent plan grants a home-page featured-photo promotion instead of premium.
FEATURE_PLAN_CODE = "feature_99"


class CreateCheckoutRequest(BaseModel):
    plan_code: str
    success_url: str
    cancel_url: str


class CreateCheckoutResponse(BaseModel):
    session_id: str
    url: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    session_id: str


class VerifyPaymentResponse(BaseModel):
    status: str
    payment_id: Optional[int] = None
    plan_code: Optional[str] = None
    premium_until: Optional[str] = None


def _parse_dt(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed
    except (TypeError, ValueError):
        return None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("/create_payment_session", response_model=CreateCheckoutResponse)
async def create_payment_session(
    data: CreateCheckoutRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe checkout session for a Sakan premium plan."""
    if not data.success_url or not data.cancel_url:
        raise HTTPException(status_code=400, detail="success_url and cancel_url are required")

    stripe_key = settings.stripe_secret_key
    if not stripe_key:
        logger.error("STRIPE_SECRET_KEY is not configured")
        raise HTTPException(status_code=503, detail="Payments are temporarily unavailable")
    stripe.api_key = stripe_key

    # 1. Authoritative pricing: load the active plan from the database.
    plan_result = await db.execute(
        select(Plans).where(Plans.code == data.plan_code, Plans.is_active == True)  # noqa: E712
    )
    plan = plan_result.scalars().first()
    if not plan or not plan.price_cents or plan.price_cents <= 0:
        raise HTTPException(status_code=400, detail="Unknown or non-purchasable plan")

    frontend_host = request.headers.get("App-Host")
    if frontend_host and not frontend_host.startswith(("http://", "https://")):
        frontend_host = f"https://{frontend_host}"
    if not frontend_host:
        raise HTTPException(status_code=400, detail="Unable to determine the app host")

    # 2. Create the pending payment record and close the DB phase.
    payment = Payments(
        user_id=str(current_user.id),
        plan_code=plan.code,
        amount_cents=int(plan.price_cents),
        currency=plan.currency or "usd",
        status="pending",
    )
    db.add(payment)
    await db.commit()
    payment_id = payment.id

    # 3. Slow external call (no open DB transaction here).
    try:
        session = await stripe.checkout.Session.create_async(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": plan.currency or "usd",
                        "product_data": {"name": f"Sakan {plan.name} Membership"},
                        "unit_amount": int(plan.price_cents),
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=f"{frontend_host}{data.success_url}{'&' if '?' in data.success_url else '?'}session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_host}{data.cancel_url}",
            metadata={
                "payment_id": str(payment_id),
                "user_id": str(current_user.id),
                "plan_code": plan.code,
            },
        )
    except stripe.error.StripeError as exc:
        logger.error("Stripe checkout creation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Payment provider rejected the checkout request")

    # 4. New short DB phase: persist the session id.
    payment.stripe_session_id = session.id
    await db.commit()

    return CreateCheckoutResponse(session_id=session.id, url=getattr(session, "url", None))


@router.post("/verify_payment", response_model=VerifyPaymentResponse)
async def verify_payment(
    data: VerifyPaymentRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify a Stripe checkout session and grant premium if paid."""
    if not data.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")

    stripe_key = settings.stripe_secret_key
    if not stripe_key:
        raise HTTPException(status_code=503, detail="Payments are temporarily unavailable")
    stripe.api_key = stripe_key

    try:
        session = await stripe.checkout.Session.retrieve_async(data.session_id)
    except stripe.error.StripeError as exc:
        logger.error("Stripe session retrieval failed: %s", exc)
        raise HTTPException(status_code=502, detail="Unable to verify the payment right now")

    metadata = getattr(session, "metadata", None) or {}
    payment_id_raw = metadata.get("payment_id")
    if not payment_id_raw or not str(payment_id_raw).isdigit():
        raise HTTPException(status_code=400, detail="This checkout session does not belong to Sakan")

    # Ownership check: the payment row must belong to the calling user.
    payment_result = await db.execute(
        select(Payments).where(Payments.id == int(payment_id_raw), Payments.user_id == str(current_user.id))
    )
    payment = payment_result.scalars().first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    payment_status = getattr(session, "payment_status", "unpaid")
    if payment_status != "paid":
        return VerifyPaymentResponse(
            status="pending",
            payment_id=payment.id,
            plan_code=payment.plan_code,
            premium_until=payment.premium_until,
        )

    # Amount sanity check against the stored authoritative amount.
    amount_total = getattr(session, "amount_total", None)
    if amount_total is not None and int(amount_total) != int(payment.amount_cents):
        logger.error(
            "Amount mismatch for payment %s: stripe=%s stored=%s",
            payment.id,
            amount_total,
            payment.amount_cents,
        )
        raise HTTPException(status_code=400, detail="Payment amount mismatch")

    plan_result = await db.execute(select(Plans).where(Plans.code == payment.plan_code))
    plan = plan_result.scalars().first()
    duration_days = plan.duration_days if plan and plan.duration_days else 30

    now = datetime.now(timezone.utc)

    # 99-cent featured-photo plan: activate/extend a home-page promotion, not premium.
    if payment.plan_code == FEATURE_PLAN_CODE:
        promo = (
            await db.execute(
                select(Promotions)
                .where(Promotions.user_id == str(current_user.id), Promotions.kind == FEATURE_PLAN_CODE)
                .order_by(Promotions.expires_at.desc())
            )
        ).scalars().first()
        current_expiry = _parse_dt(promo.expires_at) if promo else None
        base = current_expiry if current_expiry and current_expiry > now else now
        feature_until = (base + timedelta(days=duration_days)).isoformat()
        if promo:
            promo.status = "active"
            promo.expires_at = feature_until
        else:
            db.add(
                Promotions(
                    user_id=str(current_user.id),
                    kind=FEATURE_PLAN_CODE,
                    plan_code=payment.plan_code,
                    amount_cents=int(payment.amount_cents),
                    currency=payment.currency,
                    status="active",
                    expires_at=feature_until,
                )
            )
        payment.status = "paid"
        payment.premium_until = feature_until
        await db.commit()
        return VerifyPaymentResponse(
            status="paid",
            payment_id=payment.id,
            plan_code=payment.plan_code,
            premium_until=feature_until,
        )

    new_premium_until = now + timedelta(days=duration_days)

    current_until = _parse_dt(payment.premium_until) or _parse_dt(
        (await db.execute(select(Profiles.premium_until).where(Profiles.user_id == str(current_user.id))))
        .scalar()
    )
    if current_until and current_until > now:
        new_premium_until = max(new_premium_until, current_until + timedelta(days=duration_days))

    premium_iso = new_premium_until.isoformat()
    payment.status = "paid"
    payment.premium_until = premium_iso
    await db.commit()

    # Extend the caller's profile premium state.
    profile_result = await db.execute(select(Profiles).where(Profiles.user_id == str(current_user.id)))
    profile = profile_result.scalars().first()
    if profile:
        existing_until = _parse_dt(profile.premium_until)
        if not existing_until or existing_until < new_premium_until:
            profile.premium_until = premium_iso
            await db.commit()

    return VerifyPaymentResponse(
        status="paid",
        payment_id=payment.id,
        plan_code=payment.plan_code,
        premium_until=premium_iso,
    )
