import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Compass,
  Crown,
  Heart,
  Loader2,
  LogOut,
  MessageCircle,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { client } from '@/lib/api';
import { LanguageSelector } from '@/lib/i18n';
import { errDetail, getMediaUrl, sakanApi, useAuthState } from '@/lib/sakan';
import type { MeState, ProfileBrief } from '@/lib/sakan';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const GOLD = 'text-[hsl(43_78%_58%)]';

/* ---------------- logo ---------------- */

export function SakanLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src="/assets/sakan-brand.png" alt="Sakan" className="h-9 w-9 rounded-lg object-contain" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-[0.22em]">SAKAN</span>
          <span className={`font-arabic text-sm ${GOLD}`}>سكن</span>
        </span>
      )}
    </Link>
  );
}

/* ---------------- data hooks ---------------- */

export function useMeData() {
  const auth = useAuthState();
  const [me, setMe] = useState<MeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      setMe(await sakanApi.me());
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth === 'authed') refresh();
    else if (auth === 'anon') setLoading(false);
  }, [auth, refresh]);

  return { auth, me, loading: loading || auth === 'loading', error, refresh };
}

/* ---------------- gates and states ---------------- */

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
      <p className="text-sm">Opening Sakan…</p>
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border hairline bg-card p-8 text-center">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export function SignInPrompt({ message }: { message?: string }) {
  return (
    <div className="mx-auto my-24 max-w-md rounded-xl border hairline bg-card p-8 text-center">
      <img src="/assets/sakan-brand.png" alt="Sakan" className="mx-auto h-14 w-14 rounded-xl object-contain" />
      <h2 className="mt-4 text-xl font-bold">Sign in to Sakan</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? 'Sakan is a private community for marriage-minded members. Sign in to continue.'}
      </p>
      <Button className="mt-6 w-full" onClick={() => client.auth.toLogin()}>
        Sign in
      </Button>
    </div>
  );
}

/** Authenticated page shell: resolves auth + me, redirects to onboarding when needed. */
export function PageGate({
  allowNoProfile = false,
  children,
}: {
  allowNoProfile?: boolean;
  children: (me: MeState, reloadMe: () => Promise<void>) => ReactNode;
}) {
  const { auth, me, loading, error, refresh } = useMeData();

  if (loading) return <PageLoading />;
  if (auth === 'anon') return <SignInPrompt />;
  if (error) {
    if (/401|unauthorized|authentication|credentials/i.test(error)) {
      return <SignInPrompt message="Your session has expired. Sign in again to continue." />;
    }
    return <ErrorState message={error} onRetry={() => refresh()} />;
  }
  if (!me) return <ErrorState message="We could not load your account." onRetry={() => refresh()} />;
  if (!me.profile && !allowNoProfile) return <Navigate to="/onboarding" replace />;
  return <>{children(me, refresh)}</>;
}

/* ---------------- app shell ---------------- */

const NAV_ITEMS: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/connections', label: 'Connections', icon: Heart },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/me', label: 'Profile', icon: UserIcon },
];

export function AppShell({ me, children }: { me: MeState; children: ReactNode }) {
  const navigate = useNavigate();

  // Presence heartbeat: keeps the member visible in "online now" discovery.
  useEffect(() => {
    const beat = () => {
      sakanApi.presence().catch(() => undefined);
    };
    beat();
    const timer = window.setInterval(beat, 4 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const logout = async () => {
    try {
      await client.auth.logout();
    } finally {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b hairline bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <SakanLogo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
                {to === '/messages' && me.unread_total > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                    {me.unread_total > 9 ? '9+' : me.unread_total}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            {me.is_premium ? (
              <Badge className="gold-surface border-0 font-semibold text-black">
                <Crown className="mr-1 h-3.5 w-3.5" /> Premium
              </Badge>
            ) : (
              <Button asChild size="sm" className="gold-surface text-black hover:opacity-90">
                <Link to="/subscription">
                  <Crown className="mr-1.5 h-4 w-4" /> Upgrade
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-card/95 md:hidden">
        <div className="grid grid-cols-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 py-2.5 text-[11px]',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
              {to === '/messages' && me.unread_total > 0 && (
                <span className="absolute right-1/2 top-1 flex h-4 min-w-4 translate-x-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {me.unread_total > 9 ? '9+' : me.unread_total}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ---------------- member visuals ---------------- */

const AVATAR_FALLBACKS = [
  'from-sky-700/50 to-blue-950/80',
  'from-amber-600/40 to-yellow-950/70',
  'from-teal-700/40 to-slate-900/80',
  'from-indigo-700/40 to-slate-950/80',
];

export function MemberAvatar({
  objectKey,
  name,
  className,
  premium = false,
}: {
  objectKey?: string | null;
  name: string;
  className?: string;
  premium?: boolean;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    getMediaUrl(objectKey).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [objectKey]);

  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const tone = AVATAR_FALLBACKS[(name || '').length % AVATAR_FALLBACKS.length];

  return (
    <Avatar className={cn('border hairline', premium && 'ring-2 ring-[hsl(43_78%_58%_/0.6)]', className)}>
      {url ? <AvatarImage src={url} alt={name} /> : null}
      <AvatarFallback className={cn('bg-gradient-to-br font-semibold', tone)}>{initial}</AvatarFallback>
    </Avatar>
  );
}

export function VerifiedMark() {
  return <BadgeCheck className="h-4 w-4 shrink-0 text-sky-400" aria-label="Verified member" />;
}

export function PremiumMark() {
  return <Crown className={`h-4 w-4 shrink-0 ${GOLD}`} aria-label="Premium member" />;
}

export function ProfileCard({ profile, footer }: { profile: ProfileBrief; footer?: ReactNode }) {
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border hairline bg-card transition-shadow hover:shadow-md',
        profile.is_premium && 'border-[hsl(43_78%_58%_/0.35)]',
      )}
    >
      <Link to={`/profile/${profile.user_id}`} className="block">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
          <MemberAvatar
            objectKey={profile.avatar_object_key}
            name={profile.display_name}
            premium={profile.is_premium}
            className="h-full w-full rounded-none border-0"
          />
          <div className="absolute right-2 top-2 flex gap-1.5">
            {profile.is_premium && (
              <Badge className="gold-surface border-0 text-black">
                <Crown className="mr-1 h-3 w-3" /> Gold
              </Badge>
            )}
            {profile.is_verified && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="h-3 w-3 text-sky-400" /> Verified
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-1.5 p-4">
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="truncate">{profile.display_name}</span>
            {profile.is_verified && <VerifiedMark />}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {[profile.age, profile.city, profile.country].filter(Boolean).join(' · ') || 'Location private'}
          </p>
          {profile.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>}
        </div>
      </Link>
      {footer && <div className="border-t hairline p-3">{footer}</div>}
    </div>
  );
}

/* ---------------- page furniture ---------------- */

export function PageHeader({
  title,
  arabic,
  subtitle,
  actions,
}: {
  title: string;
  arabic?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {arabic && <span className={`font-arabic text-lg ${GOLD}`}>{arabic}</span>}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Heart,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border hairline bg-card p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 font-semibold">{title}</p>
      {body && <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
