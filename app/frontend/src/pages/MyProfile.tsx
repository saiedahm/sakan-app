import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Loader2, MessageSquare, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  AppShell,
  ErrorState,
  MemberAvatar,
  PageGate,
  PageHeader,
  PremiumMark,
  VerifiedMark,
} from '@/components/sakan';
import { SAKAN_BUCKET, errDetail, getMediaUrls, sakanApi } from '@/lib/sakan';
import type { FullProfile, MeState, Preferences } from '@/lib/sakan';
import { client } from '@/lib/api';
import { toast } from 'sonner';

interface PhotoRow {
  id: number;
  object_key: string;
  is_primary: boolean;
  url: string | null;
}

function ProfileForm({ profile, onSaved }: { profile: FullProfile; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: profile.display_name,
    gender: profile.gender || 'female',
    birth_date: profile.birth_date ?? '',
    country: profile.country ?? '',
    city: profile.city ?? '',
    primary_language: profile.primary_language ?? '',
    marital_status: profile.marital_status ?? '',
    bio: profile.bio ?? '',
    is_visible: true,
  });

  const set = (key: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await sakanApi.saveProfile({
            display_name: form.display_name,
            gender: form.gender,
            birth_date: form.birth_date,
            country: form.country || null,
            city: form.city || null,
            primary_language: form.primary_language || null,
            marital_status: form.marital_status || null,
            bio: form.bio || null,
          });
          toast.success('Profile saved');
          await onSaved();
        } catch (err) {
          toast.error(errDetail(err));
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p_name">Display name</Label>
          <Input id="p_name" required maxLength={60} value={form.display_name} onChange={(e) => set('display_name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_birth">Birth date</Label>
          <Input id="p_birth" type="date" required value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_country">Country</Label>
          <Input id="p_country" maxLength={80} value={form.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_city">City</Label>
          <Input id="p_city" maxLength={80} value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_lang">Primary language</Label>
          <Input id="p_lang" maxLength={40} value={form.primary_language} onChange={(e) => set('primary_language', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p_marital">Marital status</Label>
          <Input id="p_marital" maxLength={40} value={form.marital_status} onChange={(e) => set('marital_status', e.target.value)} />
        </div>
        <div className="flex items-center justify-between rounded-lg border hairline p-3 sm:col-span-2">
          <div>
            <Label htmlFor="p_visible" className="font-normal">Visible in Discover</Label>
            <p className="text-xs text-muted-foreground">Turn off to hide your profile from other members.</p>
          </div>
          <Switch id="p_visible" checked={form.is_visible} onCheckedChange={(v) => set('is_visible', v)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="p_bio">About you</Label>
          <Textarea id="p_bio" rows={4} maxLength={1000} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        Save profile
      </Button>
    </form>
  );
}

function PreferencesForm({ initial, onSaved }: { initial: Preferences | null; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    preferred_gender: initial?.preferred_gender ?? 'opposite',
    min_age: initial?.min_age ?? 21,
    max_age: initial?.max_age ?? 40,
    preferred_country: initial?.preferred_country ?? '',
  });

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await sakanApi.savePreferences({
            preferred_gender: form.preferred_gender,
            min_age: form.min_age,
            max_age: form.max_age,
            preferred_country: form.preferred_country || null,
          });
          toast.success('Preferences saved');
          await onSaved();
        } catch (err) {
          toast.error(errDetail(err));
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="space-y-2">
        <Label>Show me</Label>
        <Select value={form.preferred_gender ?? 'opposite'} onValueChange={(v) => setForm((f) => ({ ...f, preferred_gender: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="opposite">Opposite gender</SelectItem>
            <SelectItem value="female">Female only</SelectItem>
            <SelectItem value="male">Male only</SelectItem>
            <SelectItem value="any">Everyone</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf_country">Preferred country</Label>
        <Input id="pf_country" maxLength={80} value={form.preferred_country} onChange={(e) => setForm((f) => ({ ...f, preferred_country: e.target.value }))} placeholder="Any country" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf_min">Minimum age</Label>
        <Input id="pf_min" type="number" min={18} max={99} value={form.min_age ?? ''} onChange={(e) => setForm((f) => ({ ...f, min_age: e.target.value ? Number(e.target.value) : null }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pf_max">Maximum age</Label>
        <Input id="pf_max" type="number" min={18} max={99} value={form.max_age ?? ''} onChange={(e) => setForm((f) => ({ ...f, max_age: e.target.value ? Number(e.target.value) : null }))} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save preferences
        </Button>
      </div>
    </form>
  );
}

export default function MyProfile() {
  return (
    <PageGate>
      {(me: MeState, reloadMe: () => Promise<void>) => <MyProfileBody me={me} reloadMe={reloadMe} />}
    </PageGate>
  );
}

function MyProfileBody({ me, reloadMe }: { me: MeState; reloadMe: () => Promise<void> }) {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoadError('');
    try {
      const data = await sakanApi.publicProfile(me.user_id);
      setProfile(data);
      setPhotos(
        data.photos.map((p) => ({ id: p.id, object_key: p.object_key, is_primary: Boolean(p.is_primary), url: null })),
      );
      const urls = await getMediaUrls(data.photos.map((p) => p.object_key));
      setPhotos(
        data.photos.map((p) => ({ id: p.id, object_key: p.object_key, is_primary: Boolean(p.is_primary), url: urls[p.object_key] ?? null })),
      );
    } catch (e) {
      setLoadError(errDetail(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadError) {
    return (
      <AppShell me={me}>
        <PageHeader title="My profile" arabic="ملفي" />
        <ErrorState message={loadError} onRetry={load} />
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell me={me}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </AppShell>
    );
  }

  const uploadPhoto = async (file: File, asPrimary: boolean) => {
    setUploading(true);
    try {
      const objectKey = `profiles/${me.user_id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      await client.storage.upload({ bucket_name: SAKAN_BUCKET, object_key: objectKey, file });
      await sakanApi.addMedia(objectKey, asPrimary);
      if (asPrimary) {
        await sakanApi.saveProfile({ avatar_object_key: objectKey });
      }
      toast.success(asPrimary ? 'Profile photo updated' : 'Photo added');
      await Promise.all([load(), reloadMe()]);
    } catch (e) {
      toast.error(errDetail(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const deletePhoto = async (photo: PhotoRow) => {
    try {
      await sakanApi.removeMedia(photo.id);
      toast.success('Photo removed');
      await Promise.all([load(), reloadMe()]);
    } catch (e) {
      toast.error(errDetail(e));
    }
  };

  return (
    <AppShell me={me}>
      <PageHeader title="My profile" arabic="ملفي" subtitle="Manage how you appear and who you are looking for." />

      {/* identity card */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border hairline bg-card p-5">
        <div className="relative">
          <MemberAvatar objectKey={profile.avatar_object_key} name={profile.display_name} premium={profile.is_premium} className="h-20 w-20 text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-bold">{profile.display_name}</h2>
            {profile.is_verified && <VerifiedMark />}
            {profile.is_premium && <PremiumMark />}
          </div>
          <p className="text-sm text-muted-foreground">{me.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" /> {me.messages_sent}/{me.free_message_limit} messages sent
            </Badge>
            <Badge variant={me.is_premium ? 'default' : 'secondary'} className={me.is_premium ? 'gold-surface border-0 text-black' : ''}>
              {me.is_premium ? 'Premium member' : 'Free plan'}
            </Badge>
            {me.premium_until && (
              <Badge variant="secondary">Until {new Date(me.premium_until).toLocaleDateString()}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* photos */}
        <section className="rounded-xl border hairline bg-card p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold">
            <Camera className="h-4 w-4 text-accent" /> Photos
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Your primary photo appears on discovery cards. Photos are stored privately in Sakan storage.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border hairline bg-secondary">
                {p.url ? (
                  <img src={p.url} alt="Your photo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>
                )}
                {p.is_primary && (
                  <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    <Star className="h-2.5 w-2.5 fill-current" /> Primary
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!p.is_primary && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2"
                      onClick={async () => {
                        try {
                          await sakanApi.saveProfile({ avatar_object_key: p.object_key });
                          await sakanApi.addMedia(p.object_key, true);
                          toast.success('Set as primary photo');
                          await Promise.all([load(), reloadMe()]);
                        } catch (e) {
                          toast.error(errDetail(e));
                        }
                      }}
                    >
                      <Star className="mr-1 h-3.5 w-3.5" /> Primary
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" className="h-8 px-2" onClick={() => deletePhoto(p)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file, photos.length === 0);
            }}
          />
          <Button className="mt-4 w-full" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {photos.length === 0 ? 'Upload your primary photo' : 'Add a photo'}
          </Button>
        </section>

        {/* profile form */}
        <section className="rounded-xl border hairline bg-card p-5">
          <h3 className="mb-4 font-semibold">Profile details</h3>
          <ProfileForm profile={profile} onSaved={reloadMe} />
        </section>

        {/* preferences */}
        <section className="rounded-xl border hairline bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-semibold">Matching preferences</h3>
          <PreferencesForm initial={me.preferences} onSaved={reloadMe} />
        </section>
      </div>
    </AppShell>
  );
}
