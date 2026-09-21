import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  Camera,
  Compass,
  Crown,
  Eye,
  Globe,
  Heart,
  Loader2,
  LogOut,
  MessageCircle,
  Megaphone,
  Search,
  Settings,
  Sparkles,
  User as UserIcon,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SakanLogo, MemberAvatar, useMeData } from '@/components/sakan';
import { client } from '@/lib/api';
import { flagFor } from '@/lib/flags';
import { LanguageToggle, useLang } from '@/lib/i18n';
import { errDetail, sakanApi } from '@/lib/sakan';
import type { AdSlot, HomePayload, MeState, ProfileBrief } from '@/lib/sakan';
import { cn } from '@/lib/utils';

const GOLD = 'text-[hsl(43_78%_58%)]';
const GOLD_RING = 'ring-[hsl(43_78%_58%/0.65)]';

type MemberTab = 'latest' | 'nearby' | 'online';

/* ---------------- header ---------------- */

function HomeHeader({ me }: { me: MeState | null }) {
  const { t } = useLang();
  const authed = Boolean(me);

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <SakanLogo />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {authed ? (
            <Button asChild size="sm" className="gold-surface font-semibold text-black hover:opacity-90">
              <Link to="/discover">
                <Compass className="me-1.5 h-4 w-4" />
                {t('cta_enter')}
              </Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => client.auth.toLogin()}>
              {t('login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------- commercial ads ---------------- */

function AdSlotCard({ ad }: { ad: AdSlot }) {
  const { t } = useLang();
  return (
    <a
      href={ad.link_url || '/subscription'}
      className="group relative flex min-h-24 flex-col justify-between overflow-hidden rounded-xl border hairline bg-card p-4 transition-all hover:border-[hsl(43_78%_58%/0.5)] hover:shadow-md"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[hsl(43_78%_58%/0.08)] transition-transform group-hover:scale-150" />
      <div className="flex items-center gap-2">
        <Megaphone className={`h-4 w-4 shrink-0 ${GOLD}`} />
        <p className="truncate text-sm font-semibold">{ad.title}</p>
      </div>
      {ad.subtitle && (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{ad.subtitle}</p>
      )}
      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(43_78%_58%)]">
        {t('ads_book')}
        <Sparkles className="h-3 w-3" />
      </span>
    </a>
  );
}

function AdRibbon({ ads }: { ads: AdSlot[] }) {
  const { t } = useLang();
  const slots = ads.length > 0 ? ads : [];
  return (
    <section aria-label={t('ads_title')}>
      <div className="mb-2.5 flex items-center gap-2">
        <Megaphone className={`h-4 w-4 ${GOLD}`} />
        <h2 className="text-sm font-semibold tracking-wide">{t('ads_title')}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {slots.map((ad) => (
          <AdSlotCard key={ad.id} ad={ad} />
        ))}
      </div>
    </section>
  );
}

/* ---------------- 99-cent gold promo ---------------- */

function PromoBanner({ me, isFeatured }: { me: MeState | null; isFeatured: boolean }) {
  const { t } = useLang();
  const navigate = useNavigate();

  const go = () => {
    if (!me) {
      client.auth.toLogin();
      return;
    }
    navigate('/subscription');
  };

  return (
    <section className="hero-glow relative overflow-hidden rounded-2xl border border-[hsl(43_78%_58%/0.45)] bg-card p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(43_78%_58%/0.06)] to-transparent" />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gold-surface text-black">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-base font-bold leading-snug sm:text-lg" dir="rtl">
              {t('promo_title')} <span className={GOLD}>— {t('promo_sub')}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{t('featured_sub')}</p>
          </div>
        </div>
        {isFeatured ? (
          <Badge className="gold-surface shrink-0 border-0 px-3 py-1.5 text-sm font-semibold text-black">
            <Crown className="me-1.5 h-4 w-4" />
            {t('promo_active')}
          </Badge>
        ) : (
          <Button
            size="lg"
            className="gold-surface shrink-0 font-semibold text-black hover:opacity-90"
            onClick={go}
          >
            {t('promo_cta')}
            <Sparkles className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </section>
  );
}

/* ---------------- featured members ribbon ---------------- */

function FeaturedRibbon({ members }: { members: ProfileBrief[] }) {
  const { t } = useLang();
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <Crown className={`h-4 w-4 ${GOLD}`} />
        <h2 className="text-sm font-semibold">{t('featured_title')}</h2>
      </div>
      {members.length === 0 ? (
        <p className="rounded-xl border hairline bg-card p-4 text-sm text-muted-foreground" dir="rtl">
          {t('featured_empty')}
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto rounded-xl border hairline bg-card p-4 pb-3 [scrollbar-width:thin]">
          {members.map((member) => (
            <Link key={member.user_id} to={`/profile/${member.user_id}`} className="group flex w-20 shrink-0 flex-col items-center gap-2">
              <MemberAvatar
                objectKey={member.avatar_object_key}
                name={member.display_name}
                premium
                className={cn('h-16 w-16 transition-transform group-hover:scale-105', GOLD_RING)}
              />
              <span className="w-full truncate text-center text-xs font-medium">{member.display_name}</span>
              <span className="text-[10px] text-muted-foreground">
                {flagFor(member.country)} {member.country?.slice(0, 12)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------- navigation tabs ---------------- */

const TABS: Array<{ key: string; icon: LucideIcon }> = [
  { key: 'home', icon: Globe },
  { key: 'messages', icon: MessageCircle },
  { key: 'favorites', icon: Heart },
  { key: 'visitors', icon: Eye },
  { key: 'search', icon: Search },
  { key: 'latest', icon: Sparkles },
  { key: 'nearby', icon: Users },
  { key: 'online', icon: Zap },
];

function HomeNav({ me, active, onTab }: { me: MeState | null; active: MemberTab | 'home'; onTab: (tab: MemberTab) => void }) {
  const { t } = useLang();
  const navigate = useNavigate();

  const routes: Record<string, string> = {
    home: '/',
    messages: '/messages',
    favorites: '/connections',
    visitors: '/connections',
    search: '/discover',
  };

  const handle = (key: string) => {
    if (key in routes) {
      navigate(routes[key]);
      return;
    }
    if (!me) {
      client.auth.toLogin();
      return;
    }
    onTab(key as MemberTab);
  };

  return (
    <nav className="overflow-x-auto rounded-xl border hairline bg-card [scrollbar-width:thin]">
      <div className="flex min-w-max divide-x divide-[hsl(220_30%_18%)] rtl:divide-x-reverse">
        {TABS.map(({ key, icon: Icon }) => {
          const isActive = key === active || (key === 'home' && active === 'home');
          return (
            <button
              key={key}
              type="button"
              onClick={() => handle(key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm transition-colors',
                isActive ? 'bg-secondary font-semibold text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {t(key as 'home' | 'messages' | 'favorites' | 'visitors' | 'search' | 'latest' | 'nearby' | 'online')}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------------- sidebar ---------------- */

function Sidebar({ me, onSearch }: { me: MeState | null; onSearch: (q: string) => void }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const logout = async () => {
    try {
      await client.auth.logout();
    } finally {
      navigate('/');
      window.location.reload();
    }
  };

  const links: Array<{ key: 'sidebar_edit' | 'sidebar_photos' | 'sidebar_settings'; icon: LucideIcon; to: string }> = [
    { key: 'sidebar_edit', icon: UserIcon, to: '/me' },
    { key: 'sidebar_photos', icon: Camera, to: '/me' },
    { key: 'sidebar_settings', icon: Settings, to: '/me' },
  ];

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-60 lg:shrink-0">
      {/* member photos */}
      <div className="rounded-xl border hairline bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('sidebar_menu')}</p>
        {me?.profile ? (
          <Link to="/me" className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary/50">
            <MemberAvatar objectKey={me.profile.avatar_object_key} name={me.profile.display_name} className="h-10 w-10" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{me.profile.display_name}</span>
              <span className="block text-xs text-muted-foreground">{flagFor(me.profile.country)} {me.profile.country}</span>
            </span>
          </Link>
        ) : (
          <button type="button" onClick={() => client.auth.toLogin()} className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-secondary/50">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </span>
            <span className="text-sm font-medium">{t('login')}</span>
          </button>
        )}
      </div>

      {/* name search */}
      <form
        className="rounded-xl border hairline bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSearch(query.trim());
        }}
      >
        <label htmlFor="home-name-search" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('sidebar_search')}
        </label>
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="home-name-search"
            className="ps-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('sidebar_search_ph')}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
          {t('search')}
        </Button>
      </form>

      {/* menu links */}
      <div className="rounded-xl border hairline bg-card p-2">
        {links.map(({ key, icon: Icon, to }) => (
          <button
            key={key}
            type="button"
            onClick={() => (me ? navigate(to) : client.auth.toLogin())}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </button>
        ))}
        {me && (
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            {t('logout')}
          </button>
        )}
      </div>
    </aside>
  );
}

/* ---------------- member grid ---------------- */

function MemberCard({ profile }: { profile: ProfileBrief }) {
  return (
    <Link
      to={`/profile/${profile.user_id}`}
      className={cn(
        'group block overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg',
        profile.is_premium ? 'border-[hsl(43_78%_58%/0.4)]' : 'hairline',
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        <MemberAvatar
          objectKey={profile.avatar_object_key}
          name={profile.display_name}
          premium={profile.is_premium}
          className="h-full w-full rounded-none border-0"
        />
        <div className="absolute end-2 top-2 flex flex-col gap-1.5">
          {profile.is_premium && (
            <Badge className="gold-surface border-0 text-black">
              <Crown className="me-1 h-3 w-3" />
            </Badge>
          )}
          {profile.is_verified && (
            <Badge variant="secondary" className="gap-1 px-1.5">
              <BadgeCheck className="h-3 w-3 text-sky-400" />
            </Badge>
          )}
        </div>
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold">{profile.display_name}</span>
          {profile.age && <span className="text-xs text-muted-foreground">{profile.age}</span>}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {flagFor(profile.country)} {profile.country ?? '🌍'}
        </p>
      </div>
    </Link>
  );
}

/* ---------------- page ---------------- */

export default function Index() {
  const { auth, me } = useMeData();
  const { t } = useLang();
  const navigate = useNavigate();
  const [home, setHome] = useState<HomePayload | null>(null);
  const [homeError, setHomeError] = useState('');
  const [tab, setTab] = useState<MemberTab>('latest');
  const [tabMembers, setTabMembers] = useState<ProfileBrief[] | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [featuredSelf, setFeaturedSelf] = useState(false);

  const loadHome = useCallback(async () => {
    setHomeError('');
    try {
      setHome(await sakanApi.publicHome());
    } catch (e) {
      setHomeError(errDetail(e));
    }
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  // signed-in extras: featured status for the promo banner
  useEffect(() => {
    if (auth !== 'authed') return;
    sakanApi
      .me()
      .then((state) => setFeaturedSelf(Boolean(state.is_featured)))
      .catch(() => undefined);
  }, [auth]);

  // signed-in tabs switch the member grid via the discovery API
  useEffect(() => {
    if (auth !== 'authed' || tab === 'latest') {
      setTabMembers(null);
      return;
    }
    let active = true;
    setTabLoading(true);
    sakanApi
      .discover({ mode: tab, limit: 24 })
      .then((res) => {
        if (active) setTabMembers(res.items);
      })
      .catch(() => {
        if (active) setTabMembers([]);
      })
      .finally(() => {
        if (active) setTabLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth, tab]);

  const onSidebarSearch = (q: string) => {
    navigate(`/discover?q=${encodeURIComponent(q)}`);
  };

  const members = tabMembers ?? home?.latest ?? [];
  const loadingHome = !home && !homeError;

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader me={me} />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6">
        {loadingHome ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : homeError ? (
          <div className="mx-auto max-w-md rounded-xl border hairline bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">{homeError}</p>
            <Button variant="outline" className="mt-4" onClick={loadHome}>
              <Loader2 className="me-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {home && <AdRibbon ads={home.ads} />}

            <PromoBanner me={me} isFeatured={featuredSelf} />

            {home && <FeaturedRibbon members={home.featured} />}

            <HomeNav me={me} active={tab} onTab={setTab} />

            <div className="flex flex-col gap-6 lg:flex-row">
              <Sidebar me={me} onSearch={onSidebarSearch} />

              <section className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">{t('members_title')}</h2>
                    <p className="text-xs text-muted-foreground">{t('members_sub')}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {members.length} {t('all')}
                  </span>
                </div>

                {tabLoading ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-secondary/60" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="rounded-xl border hairline bg-card p-10 text-center">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {tab === 'online' ? t('online') : tab === 'nearby' ? t('nearby') : t('members_title')} — 0
                    </p>
                    {!me && (
                      <Button className="mt-4" onClick={() => client.auth.toLogin()}>
                        {t('login')}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {members.map((profile) => (
                      <MemberCard key={profile.user_id} profile={profile} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t hairline py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground sm:px-6">
          <SakanLogo />
          <p dir="rtl">{t('footer_note')}</p>
          <p className="text-xs">{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
