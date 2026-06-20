import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * A minimal, dependency-free internationalization seam.
 *
 * - {@link Locale} is the union of supported locales; add one by extending the
 *   {@link dictionaries} map below.
 * - {@link I18nProvider} holds the active locale + setter in React state, so it
 *   is SSR-safe (no `window`/`localStorage` access at module load).
 * - {@link useTranslation} returns `t(key, vars?)` — a lookup into the active
 *   dictionary with `{var}` interpolation — plus `locale` and `setLocale`.
 *
 * This is intentionally tiny: it covers the 80% case (static UI strings, a few
 * interpolated values) with zero dependencies. Swap in `i18next` / `react-intl`
 * later by keeping the same `useTranslation()` surface.
 */

export type Locale = "en" | "zh";

/** Every translatable key. Keep `en` and `zh` in lockstep — same keys. */
export type TranslationKey = keyof (typeof dictionaries)["en"];

type Dictionary = Record<string, string>;

export const dictionaries = {
  en: {
    "app.dashboard": "Dashboard",
    "app.settings": "Settings",
    "nav.search": "Search",
    "greeting.hello": "Hello, {name}",
    "greeting.welcome": "Welcome back to {app}",
    "form.name": "Name",
    "form.email": "Email",
    "form.save": "Save changes",
    "form.cancel": "Cancel",
    "locale.label": "Language",
    "items.count": "{count} items",
  },
  zh: {
    "app.dashboard": "仪表盘",
    "app.settings": "设置",
    "nav.search": "搜索",
    "greeting.hello": "你好，{name}",
    "greeting.welcome": "欢迎回到 {app}",
    "form.name": "姓名",
    "form.email": "邮箱",
    "form.save": "保存更改",
    "form.cancel": "取消",
    "locale.label": "语言",
    "items.count": "{count} 条记录",
  },
} satisfies Record<Locale, Dictionary>;

/** The locales available to switch between (in display order). */
export const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];

export const defaultLocale: Locale = "en";

/** Replace `{var}` placeholders in a template with the provided values. */
function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  defaultLocale: initial = defaultLocale,
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initial);

  const t = useCallback<I18nContextValue["t"]>(
    (key, vars) => {
      const dict = dictionaries[locale] as Dictionary;
      const fallback = dictionaries[defaultLocale] as Dictionary;
      const template = dict[key] ?? fallback[key] ?? key;
      return interpolate(template, vars);
    },
    [locale],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Read the active locale and translate keys. Must be called inside an
 * {@link I18nProvider}; throws otherwise so a missing provider fails loudly.
 */
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within an <I18nProvider>");
  }
  return ctx;
}
