import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Flag, Heart, Loader2, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppShell, ErrorState, MemberAvatar, PageGate, PremiumMark, VerifiedMark } from '@/components/sakan';
import { getMediaUrls, errDetail, sakanApi } from '@/lib/sakan';
import type { FullProfile, MeState } from '@/lib/sakan';
import { toast } from 'sonner';

const REPORT_REASONS = ['Fake profile', 'Harassment or abuse', 'Inappropriate photos', 'Scam or solicitation', 'Underage member', 'Other'];

function age(birth?: string | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function ProfileView() {
  return (
    <PageGate>
      {(me: MeState) => <ProfileBody me={me} />}
    </PageGate>
  );
}

function ProfileBody({ me }: { me: MeState }) {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await sakanApi.publicProfile(userId);
      setProfile(data);
      setPhotoUrls(await getMediaUrls(data.photo_object_keys));
      if (!data.is_self) {
        sakanApi.recordVisit(userId).catch(() => undefined);
      }
    } catch (e) {
      setError(errDetail(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  const shownAge = age(profile.birth_date) ?? profile.age;

  const doFavorite = async () => {
    setBusy(true);
    try {
      if (profile.is_favorite) {
        await sakanApi.removeFavorite(userId);
        setProfile({ ...profile, is_favorite: false });
        toast.success('Removed from favorites');
      } else {
        await sakanApi.addFavorite(userId);
        setProfile({ ...profile, is_favorite: true });
        toast.success('Added to favorites');
      }
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
    }
  };

  const doMessage = async () => {
    setBusy(true);
    try {
      const convo = await sakanApi.startConversation(userId);
      navigate(`/messages?c=${convo.id}`);
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
    }
  };

  const doBlock = async () => {
    setBusy(true);
    try {
      await sakanApi.block(userId);
      toast.success('Member blocked. They can no longer see or contact you.');
      navigate('/connections');
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
      setBlockOpen(false);
    }
  };

  const doReport = async () => {
    setBusy(true);
    try {
      await sakanApi.report({ reported_user_id: userId, reason: reportReason, details: reportDetails || undefined });
      toast.success('Report submitted. Our moderation team will review it.');
      setReportOpen(false);
      setReportDetails('');
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setBusy(false);
    }
  };

  const detailRows: Array<[string, string]> = [
    ['Age', shownAge ? String(shownAge) : 'Private'],
    ['Location', [profile.city, profile.country].filter(Boolean).join(', ') || 'Private'],
    ['Language', profile.primary_language || 'Private'],
    ['Marital status', profile.marital_status || 'Private'],
    ['Member since', profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'],
  ];

  return (
    <AppShell me={me}>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border hairline bg-card">
            <div className="aspect-[4/5] w-full bg-secondary">
              <MemberAvatar
                objectKey={profile.avatar_object_key}
                name={profile.display_name}
                premium={profile.is_premium}
                className="h-full w-full rounded-none border-0"
              />
            </div>
            <div className="space-y-2 p-5">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold">{profile.display_name}</h1>
                {profile.is_verified && <VerifiedMark />}
                {profile.is_premium && <PremiumMark />}
              </div>
              <p className="text-sm text-muted-foreground">
                {[shownAge, profile.gender, profile.city, profile.country].filter(Boolean).join(' · ')}
              </p>
              {!profile.is_self && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={doMessage} disabled={busy}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                    Message
                  </Button>
                  <Button variant={profile.is_favorite ? 'default' : 'outline'} onClick={doFavorite} disabled={busy}>
                    <Heart className={`mr-2 h-4 w-4 ${profile.is_favorite ? 'fill-current' : ''}`} />
                    {profile.is_favorite ? 'Favorited' : 'Add to favorites'}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setBlockOpen(true)}>
                      <Ban className="mr-1.5 h-4 w-4" /> Block
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => setReportOpen(true)}>
                      <Flag className="mr-1.5 h-4 w-4" /> Report
                    </Button>
                  </div>
                </div>
              )}
              {profile.is_self && (
                <Badge variant="secondary" className="mt-1">This is your profile as others see it</Badge>
              )}
            </div>
          </div>

          {photoUrls && Object.keys(photoUrls).length > 0 && (
            <div className="rounded-xl border hairline bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold flex items-center gap-1.5">
                <Star className="h-4 w-4 text-accent" /> Photos ({Object.keys(photoUrls).length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(photoUrls).map(([key, url]) => (
                  <img key={key} src={url} alt={`${profile.display_name} photo`} className="aspect-square w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border hairline bg-card p-6">
            <h2 className="mb-2 font-semibold">About</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {profile.bio || 'This member has not written a bio yet.'}
            </p>
          </div>
          <div className="rounded-xl border hairline bg-card p-6">
            <h2 className="mb-4 font-semibold">Details</h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {detailRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b hairline pb-2 last:border-0 sm:border-b">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* block confirm */}
      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {profile.display_name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            They will no longer appear in your discovery, and neither of you can message the other. This cannot be
            seen by the other member. You can unblock later from Connections.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doBlock} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
              Block member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* report */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {profile.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report_details">Details (optional)</Label>
              <Textarea id="report_details" rows={3} value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Anything our moderators should know…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doReport} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Flag className="mr-2 h-4 w-4" />}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
