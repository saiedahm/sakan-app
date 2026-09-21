import { Link } from 'react-router-dom';
import { Globe, Mail, MapPin, Scale } from 'lucide-react';
import { useLang } from '@/lib/i18n';
import { CONTACT } from '@/lib/legal';

const GOLD = 'text-[#D4AF37]';

/** Official Sakan footer: legal compliance links + owner/imprint data (German/EU law). */
export function SakanFooter() {
  const { t } = useLang();

  const legalLinks = [
    { to: '/legal/datenschutz', label: t('legal_privacy') },
    { to: '/legal/agb', label: t('legal_terms') },
    { to: '/legal/impressum', label: t('legal_imprint') },
    { to: '/legal/hinweise', label: t('legal_notices') },
  ];

  return (
    <footer className="border-t border-[#D4AF37]/20 bg-[#0F172A] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5">
            <img src="/assets/sakan-brand.png" alt="Sakan" className="h-10 w-10 rounded-lg object-contain" />
            <span className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-[0.22em] text-white">SAKAN</span>
              <span className={`font-arabic text-sm ${GOLD}`}>سكن</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">{t('footer_note')}</p>
          <a
            href={CONTACT.websiteUrl}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
          >
            <Globe className="h-4 w-4 text-slate-500" />
            <span className={GOLD}>{CONTACT.website}</span>
          </a>
        </div>

        {/* Legal & compliance links */}
        <nav aria-label="Legal">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
            <Scale className="h-4 w-4 text-slate-500" />
            <span className={GOLD}>{t('legal')}</span>
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-[#D4AF37] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Owner & contact (official imprint data) */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            <span className={GOLD}>{t('legal_owner')}</span>
          </h3>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed">
            <p className="font-semibold text-white">{CONTACT.platform}</p>
            <p>{CONTACT.owner}</p>
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <span>
                {CONTACT.addressLine1}
                <br />
                {CONTACT.addressLine2}
              </span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 shrink-0 text-slate-500" />
              <a href={`mailto:${CONTACT.emailPrimary}`} className="transition-colors hover:text-[#D4AF37]">
                {CONTACT.emailPrimary}
              </a>
            </p>
            <p className="ps-6">
              <a href={`mailto:${CONTACT.emailService}`} className="transition-colors hover:text-[#D4AF37]">
                {CONTACT.emailService}
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>
            © 2026 {CONTACT.owner} — {CONTACT.platform}
          </p>
          <p className={GOLD}>{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
