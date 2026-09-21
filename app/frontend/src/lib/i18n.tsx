import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DICT, LANGUAGES, RTL_LANGS } from '@/lib/translations';
import type { Lang, LangCode, TKey } from '@/lib/translations';

export type { Lang, LangCode, TKey };

/** Sakan localization layer: 20 languages, German (de) default, dynamic RTL/LTR. */

const STORAGE_KEY = 'sakan_lang';
const DEFAULT_LANG: LangCode = 'de';

function normalize(value: string | null): LangCode | null {
  if (!value) return null;
  return LANGUAGES.some((entry) => entry.code === value) ? (value as LangCode) : null;
}

function initialLang(): LangCode {
  try {
    return normalize(window.localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function dirFor(lang: LangCode): 'ltr' | 'rtl' {
  return RTL_LANGS.has(lang) ? 'rtl' : 'ltr';
}

interface LangContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  rtl: boolean;
  t: (key: TKey) => string;
  setLang: (lang: LangCode) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: DEFAULT_LANG,
  dir: 'ltr',
  rtl: false,
  t: (key) => DICT[DEFAULT_LANG][key],
  setLang: () => undefined,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangCode>(initialLang);

  useEffect(() => {
    const dir = dirFor(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable — language still applies for this session */
    }
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      dir: dirFor(lang),
      rtl: dirFor(lang) === 'rtl',
      t: (key: TKey) => DICT[lang][key] ?? DICT.en[key],
      setLang,
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Dropdown language selector (20 languages) used in the home header and the app shell. */
export function LanguageSelector() {
  const { lang, setLang } = useLang();
  return (
    <Select value={lang} onValueChange={(value) => setLang(value as LangCode)}>
      <SelectTrigger
        aria-label="Language"
        className="h-9 w-36 gap-1.5 rounded-lg border hairline bg-card px-3 text-xs sm:w-40"
      >
        <Languages className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {LANGUAGES.map((option) => (
          <SelectItem key={option.code} value={option.code} className="text-xs">
            {option.native}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
