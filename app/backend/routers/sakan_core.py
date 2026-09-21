"""Sakan core API: profile state, discovery, visits, favorites, blocks, reports,
messaging with block/subscription enforcement, and profile media.

Why a custom router exists next to generated CRUD routers:
- Discovery and messaging must cross the per-user ownership boundary of the
  generated entity routes (e.g. listing conversations by participant instead of
  owner, marking the other user's messages as read).
- Cross-entity business rules (blocks, premium message limits) must be enforced
  server-side.
All endpoints require an authenticated user (Atoms auth, bearer token).
"""
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Optional

from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from models.Adslots import Adslots
from models.Blocks import Blocks
from models.Conversations import Conversations
from models.Favorites import Favorites
from models.Messages import Messages
from models.Preferences import Preferences
from models.ProfilePhotos import Profilephotos
from models.Profiles import Profiles
from models.Promotions import Promotions
from models.Presences import Presences
from models.Reports import Reports
from models.Visits import Visits
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy import and_, delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sakan", tags=["sakan-core"])

FREE_MESSAGE_LIMIT = 10
MAX_MESSAGE_LENGTH = 2000
FEATURE_PLAN_CODE = "feature_99"
ONLINE_WINDOW_MINUTES = 5


# ---------- helpers ----------

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_dt(value) -> Optional[datetime]:
    if not value:
        return None
    try:
        parsed = datetime.fromisoformat(str(value))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except (TypeError, ValueError):
        return None


def _age(birth_date) -> Optional[int]:
    if not birth_date:
        return None
    try:
        born = date.fromisoformat(str(birth_date)[:10])
        today = date.today()
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    except ValueError:
        return None


def _is_premium(premium_until) -> bool:
    expires = _parse_dt(premium_until)
    return bool(expires and expires > datetime.now(timezone.utc))


async def _online_user_ids(db: AsyncSession) -> set:
    """User ids with a presence heartbeat inside the online window."""
    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=ONLINE_WINDOW_MINUTES)).isoformat()
    result = await db.execute(select(Presences.user_id).where(Presences.last_seen_at >= cutoff))
    return {row[0] for row in result.all()}


async def _my_active_promotion(db: AsyncSession, me: str) -> Optional[Promotions]:
    """The caller's currently active 99-cent featured-photo promotion, if any."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Promotions)
        .where(
            Promotions.user_id == me,
            Promotions.kind == FEATURE_PLAN_CODE,
            Promotions.status == "active",
        )
        .order_by(Promotions.expires_at.desc())
    )
    for promo in result.scalars():
        expires = _parse_dt(promo.expires_at)
        if expires and expires > now:
            return promo
    return None


def _profile_brief(p: Profiles) -> dict:
    return {
        "user_id": p.user_id,
        "username": p.username,
        "display_name": p.display_name,
        "gender": p.gender,
        "age": _age(p.birth_date),
        "country": p.country,
        "city": p.city,
        "bio": p.bio,
        "primary_language": p.primary_language,
        "marital_status": p.marital_status,
        "avatar_object_key": p.avatar_object_key,
        "is_verified": bool(p.is_verified),
        "is_premium": _is_premium(p.premium_until),
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _message_dto(m: Messages, me: str) -> dict:
    return {
        "id": m.id,
        "conversation_id": m.conversation_id,
        "sender_user_id": m.sender_user_id,
        "content": m.content,
        "is_read": bool(m.is_read),
        "is_mine": m.sender_user_id == me,
        "created_at": m.created_at.isoformat() if m.created_at else None,
    }


async def _get_profile(db: AsyncSession, user_id: str) -> Optional[Profiles]:
    result = await db.execute(select(Profiles).where(Profiles.user_id == user_id))
    return result.scalars().first()


async def _blocked_ids(db: AsyncSession, me: str) -> set:
    """User ids I blocked plus user ids who blocked me."""
    result = await db.execute(
        select(Blocks).where(or_(Blocks.user_id == me, Blocks.blocked_user_id == me))
    )
    ids = set()
    for block in result.scalars():
        if block.user_id == me:
            ids.add(block.blocked_user_id)
        else:
            ids.add(block.user_id)
    return ids


async def _primary_photo_map(db: AsyncSession, user_ids: list) -> dict:
    """Map user_id -> best available photo object_key (primary first, then oldest)."""
    if not user_ids:
        return {}
    result = await db.execute(
        select(Profilephotos)
        .where(Profilephotos.user_id.in_(user_ids))
        .order_by(Profilephotos.is_primary.desc(), Profilephotos.id.asc())
    )
    mapping: dict = {}
    for photo in result.scalars():
        mapping.setdefault(photo.user_id, photo.object_key)
    return mapping


async def _my_conversations(db: AsyncSession, me: str) -> list:
    result = await db.execute(
        select(Conversations).where(
            or_(
                Conversations.participant_a_user_id == me,
                Conversations.participant_b_user_id == me,
            )
        )
    )
    conversations = list(result.scalars())
    conversations.sort(key=lambda c: c.last_message_at or "", reverse=True)
    return conversations


# ---------- request schemas ----------

class PeerCreate(BaseModel):
    peer_user_id: str


class ReportCreate(BaseModel):
    reported_user_id: str
    reason: str
    details: Optional[str] = None


class MessageCreate(BaseModel):
    content: str


class MediaCreate(BaseModel):
    object_key: str
    is_primary: bool = False


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    username: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    primary_language: Optional[str] = None
    marital_status: Optional[str] = None
    avatar_object_key: Optional[str] = None
    is_visible: Optional[bool] = None


class PreferencesUpdate(BaseModel):
    preferred_gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    preferred_country: Optional[str] = None


# ---------- me / profile ----------

@router.get("/me")
async def get_me(current_user: UserResponse = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    me = str(current_user.id)
    profile = await _get_profile(db, me)
    preferences = (await db.execute(select(Preferences).where(Preferences.user_id == me))).scalars().first()
    conversations = await _my_conversations(db, me)
    conversation_ids = [c.id for c in conversations]

    unread_total = 0
    if conversation_ids:
        unread_total = (
            await db.execute(
                select(func.count()).select_from(Messages).where(
                    Messages.conversation_id.in_(conversation_ids),
                    Messages.sender_user_id != me,
                    Messages.is_read == False,  # noqa: E712
                )
            )
        ).scalar() or 0

    sent_count = (
        await db.execute(select(func.count()).select_from(Messages).where(Messages.sender_user_id == me))
    ).scalar() or 0

    premium_until = profile.premium_until if profile else None
    profile_brief = _profile_brief(profile) if profile else None
    if profile_brief and not profile_brief["avatar_object_key"]:
        photo_map = await _primary_photo_map(db, [me])
        profile_brief["avatar_object_key"] = photo_map.get(me)
    return {
        "user_id": me,
        "email": current_user.email,
        "name": current_user.name,
        "profile": profile_brief,
        "preferences": {
            "preferred_gender": preferences.preferred_gender if preferences else None,
            "min_age": preferences.min_age if preferences else None,
            "max_age": preferences.max_age if preferences else None,
            "preferred_country": preferences.preferred_country if preferences else None,
        }
        if preferences
        else None,
        "is_premium": _is_premium(premium_until),
        "is_featured": bool(await _my_active_promotion(db, me)),
        "premium_until": premium_until,
        "unread_total": unread_total,
        "messages_sent": sent_count,
        "free_message_limit": FREE_MESSAGE_LIMIT,
    }


@router.get("/profiles/{user_id}")
async def get_public_profile(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    profile = await _get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    blocked = await _blocked_ids(db, me)
    if user_id != me and user_id in blocked:
        raise HTTPException(status_code=404, detail="Profile not available")

    favorite = (
        await db.execute(
            select(Favorites).where(Favorites.user_id == me, Favorites.favorite_user_id == user_id)
        )
    ).scalars().first()

    photos = list(
        (await db.execute(select(Profilephotos).where(Profilephotos.user_id == user_id))).scalars().all()
    )
    photo_map = await _primary_photo_map(db, [user_id])

    return {
        **_profile_brief(profile),
        "avatar_object_key": profile.avatar_object_key or photo_map.get(user_id),
        "birth_date": profile.birth_date,
        "onboarding_completed": bool(profile.onboarding_completed),
        "is_favorite": bool(favorite),
        "is_self": user_id == me,
        "photo_object_keys": [p.object_key for p in photos],
        "photos": [
            {"id": p.id, "object_key": p.object_key, "is_primary": bool(p.is_primary)} for p in photos
        ],
    }


@router.post("/me/media")
async def add_media(
    data: MediaCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    profile = await _get_profile(db, me)
    if not profile:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    object_key = data.object_key.strip()
    if not object_key:
        raise HTTPException(status_code=400, detail="object_key is required")

    photo = Profilephotos(user_id=me, object_key=object_key, is_primary=data.is_primary, status="approved")
    db.add(photo)
    await db.commit()
    await db.refresh(photo)

    if data.is_primary or not profile.avatar_object_key:
        profile.avatar_object_key = photo.object_key
        await db.commit()

    return {
        "photo": {"id": photo.id, "object_key": photo.object_key, "is_primary": bool(photo.is_primary)},
        "avatar_object_key": profile.avatar_object_key,
    }


@router.delete("/me/media/{photo_id}")
async def remove_media(
    photo_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    photo = (
        await db.execute(select(Profilephotos).where(Profilephotos.id == photo_id, Profilephotos.user_id == me))
    ).scalars().first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    object_key = photo.object_key
    await db.delete(photo)
    await db.commit()

    profile = await _get_profile(db, me)
    if profile and profile.avatar_object_key == object_key:
        profile.avatar_object_key = None
        await db.commit()
    return {"ok": True}


PROFILE_FIELDS = (
    "username",
    "display_name",
    "gender",
    "birth_date",
    "country",
    "city",
    "bio",
    "primary_language",
    "marital_status",
    "avatar_object_key",
    "is_visible",
)


@router.put("/me/profile")
async def upsert_my_profile(
    data: ProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update the caller's profile. Used by onboarding and profile editing."""
    me = str(current_user.id)
    profile = await _get_profile(db, me)
    if not profile:
        profile = Profiles(
            user_id=me,
            display_name=(data.display_name or "").strip() or "Sakan member",
            gender=data.gender or "unspecified",
        )
        db.add(profile)

    updates = data.model_dump(exclude_unset=True)
    for field in PROFILE_FIELDS:
        if field in updates and updates[field] is not None:
            setattr(profile, field, updates[field])
    profile.onboarding_completed = True
    await db.commit()
    await db.refresh(profile)
    return {"ok": True, "profile": _profile_brief(profile)}


@router.put("/me/preferences")
async def upsert_my_preferences(
    data: PreferencesUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create or update the caller's matching preferences."""
    me = str(current_user.id)
    preferences = (await db.execute(select(Preferences).where(Preferences.user_id == me))).scalars().first()
    if not preferences:
        preferences = Preferences(user_id=me)
        db.add(preferences)

    updates = data.model_dump(exclude_unset=True)
    for field in ("preferred_gender", "min_age", "max_age", "preferred_country"):
        if field in updates:
            setattr(preferences, field, updates[field])
    await db.commit()
    await db.refresh(preferences)
    return {
        "ok": True,
        "preferences": {
            "preferred_gender": preferences.preferred_gender,
            "min_age": preferences.min_age,
            "max_age": preferences.max_age,
            "preferred_country": preferences.preferred_country,
        },
    }


# ---------- discovery ----------

@router.get("/discover")
async def discover(
    gender: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None, ge=18, le=99),
    max_age: Optional[int] = Query(None, ge=18, le=99),
    q: Optional[str] = Query(None),
    mode: Optional[str] = Query(None, description="latest (default) | nearby | online"),
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=60),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    my_profile = await _get_profile(db, me)
    if not my_profile or not my_profile.onboarding_completed:
        raise HTTPException(status_code=400, detail="Complete onboarding first")

    # Explicit query params win; otherwise fall back to stored preferences.
    preferences = (await db.execute(select(Preferences).where(Preferences.user_id == me))).scalars().first()
    eff_gender = gender or (preferences.preferred_gender if preferences else None)
    eff_country = country or (preferences.preferred_country if preferences else None)
    eff_min_age = min_age if min_age is not None else (preferences.min_age if preferences else None)
    eff_max_age = max_age if max_age is not None else (preferences.max_age if preferences else None)

    blocked = await _blocked_ids(db, me)

    result = await db.execute(
        select(Profiles)
        .where(
            Profiles.user_id != me,
            Profiles.onboarding_completed == True,  # noqa: E712
            Profiles.is_visible != False,  # noqa: E712
        )
        .order_by(Profiles.created_at.desc())
        .limit(500)
    )

    online_ids = await _online_user_ids(db) if mode == "online" else set()
    my_country = (my_profile.country or "").strip() if my_profile else ""

    profiles = list(result.scalars())
    matches: list = []
    for profile in profiles:
        if profile.user_id in blocked:
            continue
        if mode == "online" and profile.user_id not in online_ids:
            continue
        if mode == "nearby" and my_country and (profile.country or "") != my_country:
            continue
        age = _age(profile.birth_date)
        if eff_gender and profile.gender != eff_gender:
            continue
        if eff_country and (profile.country or "") != eff_country:
            continue
        if city and (profile.city or "").lower() != city.lower():
            continue
        if eff_min_age is not None and (age is None or age < eff_min_age):
            continue
        if eff_max_age is not None and (age is None or age > eff_max_age):
            continue
        if q:
            haystack = " ".join(
                part for part in [profile.display_name, profile.username, profile.city, profile.country, profile.bio or ""] if part
            ).lower()
            if q.lower() not in haystack:
                continue
        matches.append(profile)

    avatar_map = await _primary_photo_map(db, [p.user_id for p in matches])
    items = []
    for profile in matches:
        brief = _profile_brief(profile)
        brief["avatar_object_key"] = brief["avatar_object_key"] or avatar_map.get(profile.user_id)
        items.append(brief)

    total = len(items)
    return {"items": items[skip : skip + limit], "total": total, "skip": skip, "limit": limit}


# ---------- public home (no auth): ads + featured + latest ----------

@router.get("/public/home")
async def public_home(db: AsyncSession = Depends(get_db)):
    """Anonymous-friendly home payload: commercial ad slots, featured members, latest members."""
    now = datetime.now(timezone.utc)

    ads_result = await db.execute(
        select(Adslots)
        .where(Adslots.is_active == True)  # noqa: E712
        .order_by(Adslots.position.asc(), Adslots.id.asc())
        .limit(8)
    )
    ads = [
        {
            "id": ad.id,
            "title": ad.title,
            "subtitle": ad.subtitle,
            "image_object_key": ad.image_object_key,
            "link_url": ad.link_url,
            "position": ad.position,
        }
        for ad in ads_result.scalars()
    ]

    promo_result = await db.execute(
        select(Promotions)
        .where(Promotions.kind == FEATURE_PLAN_CODE, Promotions.status == "active")
        .order_by(Promotions.created_at.desc())
        .limit(50)
    )
    featured_ids: list = []
    seen: set = set()
    for promo in promo_result.scalars():
        expires = _parse_dt(promo.expires_at)
        if not expires or expires <= now or promo.user_id in seen:
            continue
        seen.add(promo.user_id)
        featured_ids.append(promo.user_id)

    featured = []
    for user_id in featured_ids[:12]:
        profile = await _get_profile(db, user_id)
        if not profile or not profile.onboarding_completed or profile.is_visible == False:  # noqa: E712
            continue
        brief = _profile_brief(profile)
        if not brief["avatar_object_key"]:
            photo_map = await _primary_photo_map(db, [user_id])
            brief["avatar_object_key"] = photo_map.get(user_id)
        featured.append(brief)

    latest_result = await db.execute(
        select(Profiles)
        .where(
            Profiles.onboarding_completed == True,  # noqa: E712
            Profiles.is_visible != False,  # noqa: E712
        )
        .order_by(Profiles.created_at.desc())
        .limit(12)
    )
    latest_profiles = list(latest_result.scalars())
    avatar_map = await _primary_photo_map(db, [p.user_id for p in latest_profiles])
    latest = []
    for profile in latest_profiles:
        brief = _profile_brief(profile)
        brief["avatar_object_key"] = brief["avatar_object_key"] or avatar_map.get(profile.user_id)
        latest.append(brief)

    return {"ads": ads, "featured": featured, "latest": latest}


# ---------- featured members (99-cent promotion) & presence ----------

@router.get("/featured")
async def featured_members(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Active 99-cent featured profiles for the home-page golden ribbon."""
    me = str(current_user.id)
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Promotions)
        .where(Promotions.kind == FEATURE_PLAN_CODE, Promotions.status == "active")
        .order_by(Promotions.created_at.desc())
        .limit(50)
    )
    promoted_user_ids: list = []
    seen: set = set()
    for promo in result.scalars():
        expires = _parse_dt(promo.expires_at)
        if not expires or expires <= now:
            continue
        if promo.user_id == me or promo.user_id in seen:
            continue
        seen.add(promo.user_id)
        promoted_user_ids.append(promo.user_id)

    blocked = await _blocked_ids(db, me)
    items = []
    for user_id in promoted_user_ids:
        if user_id in blocked:
            continue
        profile = await _get_profile(db, user_id)
        if profile:
            brief = _profile_brief(profile)
            avatar_map = await _primary_photo_map(db, [user_id])
            brief["avatar_object_key"] = brief["avatar_object_key"] or avatar_map.get(user_id)
            items.append(brief)
    return {"items": items, "total": len(items)}


@router.post("/presence")
async def presence_heartbeat(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark the caller as online right now (sliding ONLINE_WINDOW_MINUTES window)."""
    me = str(current_user.id)
    now_iso = _now_iso()
    presence = (await db.execute(select(Presences).where(Presences.user_id == me))).scalars().first()
    if presence:
        presence.last_seen_at = now_iso
    else:
        db.add(Presences(user_id=me, last_seen_at=now_iso))
    await db.commit()
    return {"ok": True, "last_seen_at": now_iso}


# ---------- visits ----------

@router.post("/profiles/{user_id}/visit")
async def record_visit(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    if user_id == me:
        return {"ok": True, "recorded": False}
    profile = await _get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    blocked = await _blocked_ids(db, me)
    if user_id in blocked:
        raise HTTPException(status_code=404, detail="Profile not available")

    db.add(Visits(user_id=me, visited_user_id=user_id, viewed_at=_now_iso()))
    await db.commit()
    return {"ok": True, "recorded": True}


@router.get("/visits")
async def my_visits(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    result = await db.execute(
        select(Visits).where(Visits.visited_user_id == me).order_by(Visits.viewed_at.desc()).limit(300)
    )
    latest_by_visitor: dict = {}
    for visit in result.scalars():
        latest_by_visitor.setdefault(visit.user_id, visit.viewed_at)

    blocked = await _blocked_ids(db, me)
    items = []
    for visitor_id, viewed_at in latest_by_visitor.items():
        if visitor_id in blocked:
            continue
        profile = await _get_profile(db, visitor_id)
        if profile:
            items.append({**_profile_brief(profile), "visited_at": viewed_at})
    avatar_map = await _primary_photo_map(db, [item["user_id"] for item in items])
    for item in items:
        item["avatar_object_key"] = item["avatar_object_key"] or avatar_map.get(item["user_id"])
    items.sort(key=lambda x: x.get("visited_at") or "", reverse=True)
    return {"items": items[:50], "total": len(items)}


# ---------- favorites ----------

@router.get("/favorites")
async def my_favorites(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    result = await db.execute(select(Favorites).where(Favorites.user_id == me).order_by(Favorites.created_at.desc()))
    favorite_ids = [f.favorite_user_id for f in result.scalars()]
    blocked = await _blocked_ids(db, me)
    items = []
    for favorite_user_id in favorite_ids:
        if favorite_user_id in blocked:
            continue
        profile = await _get_profile(db, favorite_user_id)
        if profile:
            items.append(_profile_brief(profile))
    avatar_map = await _primary_photo_map(db, [item["user_id"] for item in items])
    for item in items:
        item["avatar_object_key"] = item["avatar_object_key"] or avatar_map.get(item["user_id"])
    return {"items": items, "total": len(items)}


@router.post("/favorites/{user_id}")
async def add_favorite(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    if user_id == me:
        raise HTTPException(status_code=400, detail="You cannot favorite yourself")
    profile = await _get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = (
        await db.execute(select(Favorites).where(Favorites.user_id == me, Favorites.favorite_user_id == user_id))
    ).scalars().first()
    if not existing:
        db.add(Favorites(user_id=me, favorite_user_id=user_id))
        await db.commit()
    return {"ok": True, "is_favorite": True}


@router.delete("/favorites/{user_id}")
async def remove_favorite(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    await db.execute(
        delete(Favorites).where(Favorites.user_id == me, Favorites.favorite_user_id == user_id)
    )
    await db.commit()
    return {"ok": True, "is_favorite": False}


# ---------- blocks & reports ----------

@router.post("/blocks/{user_id}")
async def block_user(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    if user_id == me:
        raise HTTPException(status_code=400, detail="You cannot block yourself")
    profile = await _get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    existing = (
        await db.execute(select(Blocks).where(Blocks.user_id == me, Blocks.blocked_user_id == user_id))
    ).scalars().first()
    if not existing:
        db.add(Blocks(user_id=me, blocked_user_id=user_id))
        await db.commit()
    return {"ok": True, "blocked": True}


@router.delete("/blocks/{user_id}")
async def unblock_user(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    await db.execute(delete(Blocks).where(Blocks.user_id == me, Blocks.blocked_user_id == user_id))
    await db.commit()
    return {"ok": True, "blocked": False}


@router.get("/blocks")
async def my_blocks(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    result = await db.execute(select(Blocks).where(Blocks.user_id == me).order_by(Blocks.created_at.desc()))
    items = []
    for block in result.scalars():
        profile = await _get_profile(db, block.blocked_user_id)
        items.append(
            {
                "user_id": block.blocked_user_id,
                "display_name": profile.display_name if profile else block.blocked_user_id,
                "avatar_object_key": profile.avatar_object_key if profile else None,
                "blocked_at": block.created_at.isoformat() if block.created_at else None,
            }
        )
    return {"items": items, "total": len(items)}


@router.post("/reports")
async def create_report(
    data: ReportCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    if data.reported_user_id == me:
        raise HTTPException(status_code=400, detail="You cannot report yourself")
    profile = await _get_profile(db, data.reported_user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not data.reason.strip():
        raise HTTPException(status_code=400, detail="A reason is required")

    report = Reports(
        user_id=me,
        reported_user_id=data.reported_user_id,
        reason=data.reason.strip(),
        details=(data.details or "").strip() or None,
        status="open",
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return {"ok": True, "report_id": report.id, "status": report.status}


# ---------- conversations & messages ----------

@router.get("/conversations")
async def list_conversations(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    conversations = await _my_conversations(db, me)
    if not conversations:
        return {"items": [], "total": 0}

    counterpart_ids = [c.participant_b_user_id if c.participant_a_user_id == me else c.participant_a_user_id for c in conversations]
    profiles_result = await db.execute(select(Profiles).where(Profiles.user_id.in_(counterpart_ids)))
    profiles_by_user = {p.user_id: p for p in profiles_result.scalars()}
    avatar_map = await _primary_photo_map(db, counterpart_ids)

    unread_result = await db.execute(
        select(Messages.conversation_id, func.count())
        .where(
            Messages.conversation_id.in_([c.id for c in conversations]),
            Messages.sender_user_id != me,
            Messages.is_read == False,  # noqa: E712
        )
        .group_by(Messages.conversation_id)
    )
    unread_by_conversation = {conversation_id: count for conversation_id, count in unread_result.all()}

    items = []
    for conversation in conversations:
        counterpart_id = (
            conversation.participant_b_user_id
            if conversation.participant_a_user_id == me
            else conversation.participant_a_user_id
        )
        profile = profiles_by_user.get(counterpart_id)
        items.append(
            {
                "id": conversation.id,
                "counterpart_user_id": counterpart_id,
                "counterpart_display_name": profile.display_name if profile else counterpart_id,
                "counterpart_avatar_object_key": (profile.avatar_object_key if profile else None) or avatar_map.get(counterpart_id),
                "counterpart_is_verified": bool(profile.is_verified) if profile else False,
                "last_message_text": conversation.last_message_text,
                "last_message_at": conversation.last_message_at,
                "unread_count": unread_by_conversation.get(conversation.id, 0),
            }
        )
    return {"items": items, "total": len(items)}


@router.post("/conversations")
async def create_conversation(
    data: PeerCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    peer_id = data.peer_user_id
    if peer_id == me:
        raise HTTPException(status_code=400, detail="You cannot message yourself")

    peer_profile = await _get_profile(db, peer_id)
    if not peer_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    blocked = await _blocked_ids(db, me)
    if peer_id in blocked:
        raise HTTPException(status_code=403, detail="You cannot message a blocked member")

    result = await db.execute(
        select(Conversations).where(
            or_(
                and_(
                    Conversations.participant_a_user_id == me,
                    Conversations.participant_b_user_id == peer_id,
                ),
                and_(
                    Conversations.participant_a_user_id == peer_id,
                    Conversations.participant_b_user_id == me,
                ),
            )
        )
    )
    conversation = result.scalars().first()
    if not conversation:
        conversation = Conversations(user_id=me, participant_a_user_id=me, participant_b_user_id=peer_id)
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    return {
        "id": conversation.id,
        "counterpart_user_id": peer_id,
        "counterpart_display_name": peer_profile.display_name,
        "counterpart_avatar_object_key": peer_profile.avatar_object_key,
        "counterpart_is_verified": bool(peer_profile.is_verified),
        "last_message_text": conversation.last_message_text,
        "last_message_at": conversation.last_message_at,
        "unread_count": 0,
    }


async def _member_conversation(db: AsyncSession, conversation_id: int, me: str) -> Conversations:
    conversation = (
        await db.execute(select(Conversations).where(Conversations.id == conversation_id))
    ).scalars().first()
    if not conversation or me not in (conversation.participant_a_user_id, conversation.participant_b_user_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    conversation = await _member_conversation(db, conversation_id, me)

    result = await db.execute(
        select(Messages)
        .where(Messages.conversation_id == conversation_id)
        .order_by(Messages.created_at.asc(), Messages.id.asc())
        .limit(500)
    )
    messages = list(result.scalars())

    incoming_unread = [m for m in messages if m.sender_user_id != me and not m.is_read]
    if incoming_unread:
        for message in incoming_unread:
            message.is_read = True
        await db.commit()

    return {"items": [_message_dto(m, me) for m in messages], "conversation_id": conversation.id}


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    me = str(current_user.id)
    content = (data.content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(content) > MAX_MESSAGE_LENGTH:
        raise HTTPException(status_code=400, detail=f"Message must be at most {MAX_MESSAGE_LENGTH} characters")

    conversation = await _member_conversation(db, conversation_id, me)

    # Block enforcement (either direction).
    blocked = await _blocked_ids(db, me)
    counterpart_id = (
        conversation.participant_b_user_id
        if conversation.participant_a_user_id == me
        else conversation.participant_a_user_id
    )
    if counterpart_id in blocked:
        raise HTTPException(status_code=403, detail="You cannot message a blocked member")

    # Free-tier message limit enforced server-side.
    profile = await _get_profile(db, me)
    if not _is_premium(profile.premium_until if profile else None):
        sent_count = (
            await db.execute(select(func.count()).select_from(Messages).where(Messages.sender_user_id == me))
        ).scalar() or 0
        if sent_count >= FREE_MESSAGE_LIMIT:
            raise HTTPException(
                status_code=402,
                detail=f"Free plan includes {FREE_MESSAGE_LIMIT} messages. Upgrade to premium for unlimited messaging.",
            )

    message = Messages(
        user_id=me,
        conversation_id=conversation_id,
        sender_user_id=me,
        content=content,
        is_read=False,
    )
    db.add(message)
    conversation.last_message_text = content[:200]
    conversation.last_message_at = _now_iso()
    await db.commit()
    await db.refresh(message)
    return _message_dto(message, me)
