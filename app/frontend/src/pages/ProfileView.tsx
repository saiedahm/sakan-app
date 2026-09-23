import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, MessageCircle, Shield, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AppShell,
  ErrorState,
  MemberAvatar,
  PageGate,
  PremiumMark,
  VerifiedMark,
} from '@/components/sakan';
import { errDetail, getMediaUrls, sakanApi } from '@/lib/sakan';
import type { FullProfile, MeState } from '@/lib/sakan';
import { toast } from 'sonner';

export default function ProfileView() {
  return (
    <PageGate>
      {(me: MeState) => <ProfileViewBody me={me} />}
    </PageGate>
  );
}

function ProfileViewBody({ me }: { me: MeState }) {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!userId) return;

    setLoading(true);
    setError('');

    try {
      const data = await sakanApi.publicProfile(userId);
      setProfile(data);

      if (data.photos?.length) {
        const urls = await getMediaUrls(data.photos.map((p) => p.object_key));
        setPhotoUrls(urls);
      }

      try {
        const favorites = await sakanApi.favorites();
        setFavorite(favorites.items.some((p) => p.user_id === userId));
      } catch {
        // Favorites are optional here.
      }
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const toggleFavorite = async () => {
    if (!userId || busy) return;

    const wasFavorite = favorite;
    setFavorite(!wasFavorite);
    setBusy(true);

    try {
      if (wasFavorite) {
        await sakanApi.removeFavorite(userId);
        toast.success('Removed from favorites');
      } else {
        await sakanApi.addFavorite(userId);
        toast.success('Added to favorites');
      }
    } catch (e) {
      setFavorite(wasFavorite);
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
    }
  };

  const block = async () => {
    if (!userId || busy) return;

    setBusy(true);

    try {
      await sakanApi.block(userId);
      toast.success('Member blocked');
      navigate('/discover');
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AppShell me={me}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell me={me}>
        <ErrorState message={error || 'Profile not found'} onRetry={load} />
      </AppShell>
    );
  }

  return (
    <AppShell me={me}>
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl border hairline bg-card">
          <div className="relative h-32 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary" />

          <div className="px-5 pb-6">
            <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <MemberAvatar
                  objectKey={profile.avatar_object_key}
                  name={profile.display_name}
                  premium={profile.is_premium}
                  className="h-24 w-24 border-4 border-card text-2xl"
                />

                <div className="pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                    {profile.is_verified && <VerifiedMark />}
                    {profile.is_premium && <PremiumMark />}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {[profile.age, profile.city, profile.country]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant={favorite ? 'default' : 'outline'} onClick={toggleFavorite} disabled={busy}>
                  <Heart className={`mr-2 h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
                  {favorite ? 'Favorited' : 'Favorite'}
                </Button>

                <Button asChild>
                  <Link to={`/messages?c=${profile.conversation_id ?? ''}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Message
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div className="space-y-6">
                {profile.photos?.length > 0 && (
                  <div>
                    <h2 className="mb-3 font-semibold">Photos</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {profile.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="aspect-square overflow-hidden rounded-xl bg-secondary"
                        >
                          {photoUrls[photo.object_key] ? (
                            <img
                              src={photoUrls[photo.object_key]}
                              alt={profile.display_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 font-semibold">About</h2>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {profile.bio || 'This member has not added a bio yet.'}
                  </p>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-xl border hairline bg-secondary/30 p-4">
                  <h2 className="mb-3 flex items-center gap-2 font-semibold">
                    <UserRound className="h-4 w-4 text-accent" />
                    Profile
                  </h2>

                  <div className="space-y-3 text-sm">
                    {profile.gender && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Gender</span>
                        <span>{profile.gender}</span>
                      </div>
                    )}

                    {profile.primary_language && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Language</span>
                        <span>{profile.primary_language}</span>
                      </div>
                    )}

                    {profile.marital_status && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Status</span>
                        <span>{profile.marital_status}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border hairline bg-secondary/30 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Stay respectful</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Keep conversations purposeful and report anything that makes you uncomfortable.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="mt-3 w-full text-destructive hover:text-destructive"
                    onClick={block}
                    disabled={busy}
                  >
                    Block this member
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
