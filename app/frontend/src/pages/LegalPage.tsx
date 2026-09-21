import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { CONTACT, LEGAL_DOCS } from '@/lib/legal';
import type { LegalDocKind } from '@/lib/legal';

const VALID_KINDS: LegalDocKind[] = ['datenschutz', 'agb', 'impressum', 'hinweise'];

/** Legal document page: Impressum, Datenschutz (DSGVO), AGB, dating disclaimers. */
export default function LegalPage() {
  const { kind } = useParams<{ kind: string }>();
  const { lang } = useLang();

  const docKind = (VALID_KINDS as string[]).includes(kind ?? '')
    ? (kind as LegalDocKind)
    : 'impressum';
  // German jurisdiction documents in German; English edition for all other languages.
  const doc = LEGAL_DOCS[docKind][lang === 'de' ? 'de' : 'en'];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b hairline">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Sakan
          </Link>
          <a href={CONTACT.websiteUrl} className="text-sm font-semibold text-[#D4AF37] hover:underline">
            {CONTACT.website}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <article className="rounded-2xl border border-[#D4AF37]/25 bg-card p-6 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0F172A] text-[#D4AF37]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
              <p className="text-sm text-muted-foreground">{doc.subtitle}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{doc.updated}</p>

          <div className="mt-8 space-y-8">
            {doc.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-base font-semibold text-[#D4AF37]">{section.heading}</h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="mt-2 text-sm leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-foreground/90">
                    {section.bullets.map((bullet) => (
                      <li key={bullet.slice(0, 32)}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <footer className="mt-10 border-t hairline pt-5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              {CONTACT.platform} · {CONTACT.owner}
            </p>
            <p>
              {CONTACT.addressLine1}, {CONTACT.addressLine2}
            </p>
            <p>
              {CONTACT.emailPrimary} · {CONTACT.emailService} · {CONTACT.website}
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
