import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/** Sakan bilingual layer: Arabic-first (RTL) with English fallback. Hardcoded dictionary — no translation API. */

export type Lang = 'ar' | 'en';

const AR = {
  home: 'الرئيسية',
  messages: 'الرسائل',
  favorites: 'المفضلة',
  visitors: 'الزوار',
  search: 'البحث',
  latest: 'الأحدث',
  nearby: 'من بلدك',
  online: 'متصلون الآن',
  discover: 'اكتشف',
  profile: 'ملفي',
  connections: 'روابطي',
  membership: 'العضوية',
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  join: 'انضم إلى سكن',
  upgrade: 'ترقية',
  premium: 'مميز',
  all: 'الكل',
  hero_tagline: 'بيت لبدايتك الجديدة',
  hero_sub: 'منصة تعارف جادة للزواج داخل المجتمع العربي',
  ads_title: 'مساحة إعلانية تجارية',
  ads_book: 'احجز الآن',
  featured_title: 'أعضاء مميزون',
  featured_sub: 'صور مثبتة في أعلى المنصة عبر عرض الـ 99 سنت',
  featured_empty: 'كن أول الأعضاء المميزين على منصة سكن',
  promo_title: 'إعلان صورتك أعلى منصة سكن مقابل 99 سنت',
  promo_sub: 'فرصة ذهبية — 99 سنت فقط لمدة 7 أيام',
  promo_cta: 'أعلن صورتك الآن',
  promo_active: 'صورتك مميزة حاليًا',
  members_title: 'أحدث الأعضاء',
  members_sub: 'تعرّف على أحدث من انضم إلى مجتمع سكن',
  sidebar_menu: 'قائمة الأعضاء',
  sidebar_search: 'بحث بالاسم',
  sidebar_search_ph: 'اكتب اسمًا…',
  sidebar_my_photos: 'صوري',
  sidebar_edit: 'تعديل الملف الشخصي',
  sidebar_photos: 'الصور',
  sidebar_settings: 'الإعدادات',
  anon_title: 'مرحبًا بك في سكن',
  anon_body: 'سجّل الدخول لتشاهد الأعضاء، وتضيف المفضلة، وتبدأ محادثة جادة.',
  sign_in_cta: 'سجّل الدخول',
  cta_enter: 'ادخل سكن',
  verified: 'موثوق',
  footer_note: 'مجتمع خاص للأعضاء الجادين في الزواج',
  copyright: '© 2026 سكن — بثقة وخصوصية ونية صادقة',
} as const;

const EN: Record<keyof typeof AR, string> = {
  home: 'Home',
  messages: 'Messages',
  favorites: 'Favorites',
  visitors: 'Visitors',
  search: 'Search',
  latest: 'Latest',
  nearby: 'Nearby',
  online: 'Online now',
  discover: 'Discover',
  profile: 'My profile',
  connections: 'Connections',
  membership: 'Membership',
  login: 'Sign in',
  logout: 'Sign out',
  join: 'Join Sakan',
  upgrade: 'Upgrade',
  premium: 'Premium',
  all: 'All',
  hero_tagline: 'A home for your new beginning',
  hero_sub: 'A serious, marriage-focused matchmaking community',
  ads_title: 'Commercial ad space',
  ads_book: 'Book now',
  featured_title: 'Featured members',
  featured_sub: 'Photos pinned at the top via the 99-cent offer',
  featured_empty: 'Be the first featured member on Sakan',
  promo_title: 'Pin your photo at the top of Sakan for 99 cents',
  promo_sub: 'Golden opportunity — just 99¢ for 7 days',
  promo_cta: 'Feature my photo',
  promo_active: 'Your photo is currently featured',
  members_title: 'Newest members',
  members_sub: 'Meet the latest people to join the Sakan community',
  sidebar_menu: 'Member menu',
  sidebar_search: 'Name search',
  sidebar_search_ph: 'Type a name…',
  sidebar_my_photos: 'My photos',
  sidebar_edit: 'Edit profile',
  sidebar_photos: 'Photos',
  sidebar_settings: 'Settings',
  anon_title: 'Welcome to Sakan',
  anon_body: 'Sign in to browse members, save favorites, and start serious conversations.',
  sign_in_cta: 'Sign in',
  cta_enter: 'Enter Sakan',
  verified: 'Verified',
  footer_note: 'A private community for marriage-minded members.',
  copyright: '© 2026 Sakan — built with trust, privacy, and intention.',
};

const DICT: Record<Lang, Record<keyof typeof AR, string>> = { ar: AR, en: EN };

export type TKey = keyof typeof AR;

interface LangContextValue {
  lang: Lang;
  rtl: boolean;
  t: (key: TKey) => string;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'ar',
  rtl: true,
  t: (key) => AR[key],
  setLang: () => undefined,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const stored = window.localStorage.getItem('sakan_lang');
      return stored === 'en' || stored === 'ar' ? stored : 'ar';
    } catch {
      return 'ar';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem('sakan_lang', lang);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({ lang, rtl: lang === 'ar', t: (key) => DICT[lang][key], setLang }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Compact AR/EN switch used in the home header and the app shell. */
export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex overflow-hidden rounded-lg border hairline text-xs" role="group" aria-label="Language">
      {(['ar', 'en'] as Lang[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={
            lang === option
              ? 'bg-secondary px-2.5 py-1.5 font-semibold text-foreground'
              : 'px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground'
          }
        >
          {option === 'ar' ? 'عربي' : 'EN'}
        </button>
      ))}
    </div>
  );
}
