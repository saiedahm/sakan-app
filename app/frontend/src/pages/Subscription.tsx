import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, Check, Crown, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppShell, ErrorState, PageGate, PageHeader } from '@/components/sakan';
import { client } from '@/lib/api';
import { errDetail, formatPrice, parsePlanFeatures, sakanApi } from '@/lib/sakan';
import type { MeState, Plan } from '@/lib/sakan';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

async function fetchPlans(): Promise<Plan[]> {
  const res = await client.apiCall.invoke({ url: '/api/v1/plans', method: 'GET', data: { is_active: true, limit: 20 } });
  const rows = (res?.data?.items ?? res?.data ?? []) as Plan[];
  return rows
    .filter((p) => p.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export default function Subscription() {
  return (
    <PageGate allowNoProfile>
      {(me: MeState, reloadMe: () => Promise<void>) => <SubscriptionBody me={me} reloadMe={reloadMe} />}
    </PageGate>
  );
}

function SubscriptionBody({ me, reloadMe }: { me: MeState; reloadMe: () => Promise<void> }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(Boolean(sessionId));
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setPlans(await fetchPlans());
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // verify Stripe checkout when redirected back with ?session_id=
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    (async () => {
      setVerifying(true);
      try {
        const result = await sakanApi.verifyPayment(sessionId);
        if (!active) return;
        if (result.status === 'paid' || result.status === 'succeeded' || result.status === 'complete') {
          setVerifyResult(`Payment confirmed — ${result.plan_code ?? 'plan'} is now active. Welcome to Premium.`);
          await reloadMe();
        } else {
          setVerifyResult(`Payment status: ${result.status}. If you just completed checkout, refresh in a moment.`);
        }
      } catch (e) {
        if (active) setVerifyResult(errDetail(e));
      } finally {
        if (active) setVerifying(false);
        setSearchParams({}, { replace: true });
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const subscribe = async (plan: Plan) => {
    setBusyPlan(plan.code);
    try {
      const base = `${window.location.origin}/subscription`;
      const checkout = await sakanApi.createCheckout(plan.code, {
        success_url: `${base}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: base,
      });
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      toast.error('Checkout session created but no redirect URL was returned. Please try again or contact support.');
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <AppShell me={me}>
      <PageHeader
        title="Membership"
        arabic="العضوية"
        subtitle={me.is_premium ? 'You are a Premium member. Thank you for supporting Sakan.' : 'Upgrade for unlimited messaging, priority discovery, and more.'}
      />

      {verifying && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border hairline bg-card p-4">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          <p className="text-sm">Verifying your payment…</p>
        </div>
      )}
      {verifyResult && !verifying && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border hairline bg-card p-4">
          <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
          <p className="text-sm">{verifyResult}</p>
        </div>
      )}

      {me.is_premium && me.premium_until && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border hairline bg-card p-4">
          <Crown className="h-4 w-4 text-[hsl(43_78%_58%)]" />
          <p className="text-sm">Premium active until <strong>{new Date(me.premium_until).toLocaleDateString()}</strong></p>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : plans.length === 0 ? (
        <ErrorState message="No plans are currently available. Please check back soon." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const features = parsePlanFeatures(plan);
            const highlight = plan.code !== 'free';
            return (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-xl border bg-card p-6',
                  highlight ? 'border-[hsl(43_78%_58%_/0.45)] shadow-lg' : 'hairline',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  {highlight && (
                    <Badge className="gold-surface border-0 text-black">
                      <Crown className="mr-1 h-3 w-3" /> Premium
                    </Badge>
                  )}
                </div>
                {plan.tagline && <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>}
                <p className="mt-4 text-3xl font-bold">
                  {formatPrice(plan.price_cents, plan.currency)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {plan.price_cents > 0 ? ` / ${plan.duration_days} days` : ''}
                  </span>
                </p>
                <ul className="mb-6 mt-5 flex-1 space-y-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.price_cents > 0 ? (
                  <Button
                    className="gold-surface font-semibold text-black hover:opacity-90"
                    disabled={busyPlan === plan.code || verifying}
                    onClick={() => subscribe(plan)}
                  >
                    {busyPlan === plan.code ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                    Subscribe to {plan.name}
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    {me.is_premium ? 'Included in your plan' : 'Your current plan'}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-xl border hairline bg-card p-5 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
        <p>
          Payments are processed securely by Stripe. Sakan never stores your card details. You can cancel anytime —
          premium features remain active until the end of your billing period.
        </p>
      </div>
    </AppShell>
  );
}
