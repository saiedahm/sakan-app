
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, Eye, Heart, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell, EmptyState, ErrorState, MemberAvatar, PageGate, PageHeader, ProfileCard } from '@/components/sakan';
import { errDetail, sakanApi } from '@/lib/sakan';
import type { BlockEntry, MeState, ProfileBrief, VisitedProfile } from '@/lib/sakan';
import { toast } from 'sonner';

export default function Connections() {
  return (
    <PageGate>
      {(me: MeState) => <ConnectionsBody me={me} />}
    </PageGate>
  );
}

function ConnectionsBody({ me }: { me: MeState }) {
  const [favorites, setFavorites] = useState<ProfileBrief[]>([]);
  const [visitors, setVisitors] = useState<VisitedProfile[]>([]);
  const [blocks, setBlocks] = useState<BlockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [f, v, b] = await Promise.all([sakanApi.favorites(), sakanApi.visits(), sakanApi.blocks()]);
      setFavorites(f.items);
      setVisitors(v.items);
      setBlocks(b.items);
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeFavorite = async (userId: string) => {
    setFavorites((prev) => prev.filter((p) => p.user_id !== userId));
    try {
      await sakanApi.removeFavorite(userId);
      toast.success('Removed from favorites');
    } catch (e) {
      toast.error(errDetail(e));
      load();
    }
  };

  const unblock = async (userId: string) => {
    setBlocks((prev) => prev.filter((b) => b.user_id !== userId));
    try {
      await sakanApi.unblock(userId);
      toast.success('Member unblocked');
    } catch (e) {
      toast.error(errDetail(e));
      load();
    }
  };

  return (
    <AppShell me={me}>
      <PageHeader title="Connections" arabic="روابطك" subtitle="Favorites, members who visited you, and your privacy controls." />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Tabs defaultValue="favorites">
          <TabsList className="mb-4">
            <TabsTrigger value="favorites" className="gap-1.5">
              <Heart className="h-4 w-4" /> Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-1.5">
              <Eye className="h-4 w-4" /> Visited you ({visitors.length})
            </TabsTrigger>
            <TabsTrigger value="blocked" className="gap-1.5">
              <Ban className="h-4 w-4" /> Blocked ({blocks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites">
            {favorites.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No favorites yet"
                body="Tap the heart on a profile to save members you want to revisit."
                action={<Button asChild><Link to="/discover">Browse Discover</Link></Button>}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((p) => (
                  <ProfileCard
                    key={p.user_id}
                    profile={p}
                    footer={
                      <Button variant="outline" className="w-full" onClick={() => removeFavorite(p.user_id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visitors">
            {visitors.length === 0 ? (
              <EmptyState
                icon={Eye}
                title="No profile visits yet"
                body="When members view your profile, they will appear here."
              />
            ) : (
              <div className="space-y-2">
                {visitors.map((v) => (
                  <Link
                    key={`${v.user_id}-${v.visited_at ?? v.user_id}`}
                    to={`/profile/${v.user_id}`}
                    className="flex items-center gap-3 rounded-xl border hairline bg-card p-3 transition-colors hover:bg-secondary/50"
                  >
                    <MemberAvatar objectKey={v.avatar_object_key} name={v.display_name} premium={v.is_premium} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{v.display_name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {[v.age, v.city, v.country].filter(Boolean).join(' · ') || 'Private location'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {v.visited_at ? new Date(v.visited_at).toLocaleString() : ''}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocked">
            {blocks.length === 0 ? (
              <EmptyState
                icon={Ban}
                title="No blocked members"
                body="Blocked members cannot see your profile or message you."
              />
            ) : (
              <div className="space-y-2">
                {blocks.map((b) => (
                  <div key={b.user_id} className="flex items-center gap-3 rounded-xl border hairline bg-card p-3">
                    <MemberAvatar objectKey={b.avatar_object_key} name={b.display_name} className="h-12 w-12" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{b.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.blocked_at ? `Blocked ${new Date(b.blocked_at).toLocaleDateString()}` : 'Blocked'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => unblock(b.user_id)}>
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}
