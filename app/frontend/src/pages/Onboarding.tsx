
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageGate, PageHeader } from '@/components/sakan';
import { errDetail, sakanApi } from '@/lib/sakan';
import type { MeState, ProfileInput, PreferencesInput } from '@/lib/sakan';
import { toast } from 'sonner';

const COUNTRIES = ['Saudi Arabia', 'United Arab Emirates', 'Egypt', 'Jordan', 'Morocco', 'Kuwait', 'Qatar', 'United Kingdom', 'United States', 'Canada', 'Germany', 'Turkey', 'Other'];
const LANGUAGES = ['Arabic', 'English', 'French', 'Urdu', 'Turkish', 'Malay', 'Indonesian', 'Spanish', 'Other'];
const MARITAL = ['Never married', 'Divorced', 'Widowed', 'Annulled'];

function todayISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d.toISOString().slice(0, 10);
}

function ProfileForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
  showStepHint,
}: {
  initial?: Partial<ProfileInput>;
  onSubmit: (data: ProfileInput) => void;
  submitting: boolean;
  submitLabel: string;
  showStepHint?: boolean;
}) {
  const [form, setForm] = useState<Partial<ProfileInput>>({
    display_name: '',
    gender: 'female',
    birth_date: todayISO(),
    marital_status: 'Never married',
    ...initial,
  });

  const set = (key: keyof ProfileInput, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as ProfileInput);
      }}
    >
      {showStepHint && (
        <div className="rounded-lg border hairline bg-card p-4 text-sm text-muted-foreground">
          Tell the community who you are. Only your first name, age, and location are shown on discovery cards.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name *</Label>
          <Input id="display_name" required maxLength={60} value={form.display_name ?? ''} onChange={(e) => set('display_name', e.target.value)} placeholder="e.g. Sara" />
        </div>
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select value={form.gender ?? 'female'} onValueChange={(v) => set('gender', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="birth_date">Birth date *</Label>
          <Input id="birth_date" type="date" required max={todayISO()} value={form.birth_date ?? ''} onChange={(e) => set('birth_date', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Marital status</Label>
          <Select value={form.marital_status ?? ''} onValueChange={(v) => set('marital_status', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {MARITAL.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={form.country ?? ''} onValueChange={(v) => set('country', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" maxLength={80} value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Riyadh" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Primary language</Label>
          <Select value={form.primary_language ?? ''} onValueChange={(v) => set('primary_language', v)}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="bio">About you</Label>
          <Textarea id="bio" rows={4} maxLength={1000} value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} placeholder="Your values, intentions, and what a good match looks like…" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}

function PreferencesForm({
  initial,
  onSubmit,
  submitting,
  submitLabel,
}: {
  initial?: Partial<PreferencesInput>;
  onSubmit: (data: PreferencesInput) => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<Partial<PreferencesInput>>({
    preferred_gender: 'opposite',
    min_age: 21,
    max_age: 40,
    ...initial,
  });
  const set = (key: keyof PreferencesInput, value: string | number | null) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form as PreferencesInput);
      }}
    >
      <div className="rounded-lg border hairline bg-card p-4 text-sm text-muted-foreground">
        These filters shape your Discover feed. You can change them anytime.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Show me</Label>
          <Select value={form.preferred_gender ?? 'opposite'} onValueChange={(v) => set('preferred_gender', v)}>
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
          <Label>Preferred country</Label>
          <Select value={form.preferred_country ?? ''} onValueChange={(v) => set('preferred_country', v)}>
            <SelectTrigger><SelectValue placeholder="Any country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any country</SelectItem>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_age">Minimum age</Label>
          <Input id="min_age" type="number" min={18} max={99} value={form.min_age ?? ''} onChange={(e) => set('min_age', e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_age">Maximum age</Label>
          <Input id="max_age" type="number" min={18} max={99} value={form.max_age ?? ''} onChange={(e) => set('max_age', e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [savedProfile, setSavedProfile] = useState<Partial<ProfileInput> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <PageGate allowNoProfile>
      {(me: MeState, reloadMe: () => Promise<void>) => (
        <div className="mx-auto max-w-2xl">
          <PageHeader
            title="Welcome to Sakan"
            arabic="أهلاً بك"
            subtitle={`Complete your profile to join the community${me.email ? `, ${me.email}` : ''}.`}
          />

          <div className="mb-6 flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-accent' : 'bg-secondary'}`} />
              </div>
            ))}
          </div>

          <div className="rounded-xl border hairline bg-card p-6">
            {step === 1 ? (
              <>
                <h2 className="mb-4 font-semibold">Step 1 of 2 — Your profile</h2>
                <ProfileForm
                  submitting={submitting}
                  submitLabel="Save and continue"
                  showStepHint
                  initial={savedProfile ?? undefined}
                  onSubmit={async (data: ProfileInput) => {
                    setSubmitting(true);
                    try {
                      await sakanApi.saveProfile(data);
                      setSavedProfile(data);
                      setStep(2);
                    } catch (e) {
                      toast.error(errDetail(e));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                />
              </>
            ) : (
              <>
                <h2 className="mb-4 font-semibold">Step 2 of 2 — Matching preferences</h2>
                <PreferencesForm
                  submitting={submitting}
                  submitLabel="Finish and discover"
                  onSubmit={async (data: PreferencesInput) => {
                    setSubmitting(true);
                    try {
                      await sakanApi.savePreferences(data);
                      await reloadMe();
                      toast.success('Welcome to Sakan');
                      navigate('/discover', { replace: true });
                    } catch (e) {
                      toast.error(errDetail(e));
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                />
                <Button variant="ghost" className="mt-3 w-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to profile
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </PageGate>
  );
}
