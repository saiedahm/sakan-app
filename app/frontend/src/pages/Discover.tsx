import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AppShell,
  CardsSkeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  PageGate,
  ProfileCard,
} from '@/components/sakan';
import { errDetail, sakanApi } from '@/lib/sakan';
import type { MeState, ProfileBrief } from '@/lib/sakan';
import { toast } from 'sonner';

const PAGE_SIZE = 12;

type DiscoverMode = 'any' | 'latest' | 'nearby' | 'online';

interface Filters {
  q: string;
  gender: string;
  country: string;
  city: string;
  min_age: string;
  max_age: string;
  mode: DiscoverMode;
}

const EMPTY_FILTERS: Filters = { q: '', gender: 'any', country: '', city: '', min_age: '', max_age: '', mode: 'any' };

export default function Discover() {
  return (
    <PageGate>
      {(me: MeState) => <DiscoverBody me={me} />}
    </PageGate>
  );
}

function DiscoverBody({ me }: { me: MeState }) {
  const [searchParams] = useSearchParams();

  // Deep links: /discover?q=... (sidebar name search) and /discover?mode=latest|nearby|online (home tabs).
  const urlFilters = (): Filters => {
    const modeRaw = searchParams.get('mode');
    return {
      ...EMPTY_FILTERS,
      q: searchParams.get('q') ?? '',
      mode:
        modeRaw === 'latest' || modeRaw === 'nearby' || modeRaw === 'online' ? (modeRaw as DiscoverMode) : 'any',
    };
  };

  const [filters, setFilters] = useState<Filters>(urlFilters);
  const [applied, setApplied] = useState<Filters>(urlFilters);
  const [items, setItems] = useState<ProfileBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  const fetchPage = useCallback(
    async (skip: number, f: Filters, append: boolean) => {
      setError('');
      try {
        const params = {
          q: f.q || undefined,
          mode: f.mode !== 'any' ? f.mode : undefined,
          gender: f.gender !== 'any' ? f.gender : undefined,
          country: f.country || undefined,
          city: f.city || undefined,
          min_age: f.min_age ? Number(f.min_age) : undefined,
          max_age: f.max_age ? Number(f.max_age) : undefined,
          skip,
          limit: PAGE_SIZE,
        };
        const res = await sakanApi.discover(params);
        setItems((prev) => (append ? [...prev, ...res.items] : res.items));
        setTotal(res.total);
      } catch (e) {
        setError(errDetail(e));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPage(0, applied, false);
  }, [applied, fetchPage]);

  useEffect(() => {
    sakanApi
      .favorites()
      .then((res) => setFavIds(new Set(res.items.map((p) => p.user_id))))
      .catch(() => undefined);
  }, []);

  const toggleFavorite = async (userId: string) => {
    const wasFav = favIds.has(userId);
    setFavIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(userId);
      else next.add(userId);
      return next;
    });
    try {
      if (wasFav) await sakanApi.removeFavorite(userId);
      else await sakanApi.addFavorite(userId);
      toast.success(wasFav ? 'Removed from favorites' : 'Added to favorites');
    } catch (e) {
      setFavIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(userId);
        else next.delete(userId);
        return next;
      });
      toast.error(errDetail(e));
    }
  };

  const setF = (key: keyof Filters, value: string) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <AppShell me={me}>
      <PageHeader
        title="Discover"
        arabic="اكتشف"
        subtitle={total > 0 ? `${total} member${total === 1 ? '' : 's'} match your preferences` : 'Members matching your preferences'}
      />

      <form
        className="mb-6 grid gap-3 rounded-xl border hairline bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setApplied(filters);
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="q">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="q" className="pl-8" value={filters.q} onChange={(e) => setF('q', e.target.value)} placeholder="Name, bio, city…" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <Select value={filters.gender} onValueChange={(v) => setF('gender', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Everyone</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Mode</Label>
          <Select value={filters.mode} onValueChange={(v) => setF('mode', v as DiscoverMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All members</SelectItem>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="nearby">Nearby (my country)</SelectItem>
              <SelectItem value="online">Online now</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={filters.country} onChange={(e) => setF('country', e.target.value)} placeholder="Any country" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={filters.city} onChange={(e) => setF('city', e.target.value)} placeholder="Any city" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="min_age">Min age</Label>
            <Input id="min_age" type="number" min={18} max={99} value={filters.min_age} onChange={(e) => setF('min_age', e.target.value)} placeholder="18" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="max_age">Max age</Label>
            <Input id="max_age" type="number" min={18} max={99} value={filters.max_age} onChange={(e) => setF('max_age', e.target.value)} placeholder="99" />
          </div>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Apply filters
          </Button>
        </div>
      </form>

      {loading ? (
        <CardsSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchPage(0, applied, false)} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches yet"
          body="Try widening your filters, or check back soon — new members join regularly."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProfileCard
                key={p.user_id}
                profile={p}
                footer={
                  <Button
                    variant={favIds.has(p.user_id) ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => toggleFavorite(p.user_id)}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${favIds.has(p.user_id) ? 'fill-current' : ''}`} />
                    {favIds.has(p.user_id) ? 'Favorited' : 'Add to favorites'}
                  </Button>
                }
              />
            ))}
          </div>
          {items.length < total && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                disabled={loadingMore}
                onClick={() => {
                  setLoadingMore(true);
                  fetchPage(items.length, applied, true);
                }}
              >
                {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
