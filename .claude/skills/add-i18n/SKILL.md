---
name: add-i18n
description: Add a lightweight, dependency-free internationalization seam — a Locale type, per-locale dictionaries, an I18nProvider, and useTranslation() returning t(key, vars) with {var} interpolation and locale/setLocale. Use to translate UI strings across locales. Ships a copy-ready seam + demo.
---

# Add internationalization

A tiny i18n seam: `dictionaries` (one per `Locale`), an `I18nProvider` that holds
the active locale in React state (SSR-safe — no `window` at module load), and
`useTranslation()` returning `t(key, vars?)` with `{var}` interpolation plus
`locale` / `setLocale`. The seam (`i18n.tsx`) and a gallery demo are **bundled**
under `templates/` — copy, don't paste.

## Add it

```bash
cp .claude/skills/add-i18n/templates/i18n.tsx src/lib/i18n.tsx
# Optional: a gallery panel showing a live locale switcher
cp .claude/skills/add-i18n/templates/localization.tsx src/routes/_app/gallery/localization.tsx
```

Then:
1. **Wrap a subtree** (the whole app in `__root.tsx`, or one page) in
   `<I18nProvider>`. Read the locale + translate with `useTranslation()`.
2. **Add strings** to `dictionaries` — every key must exist in both `en` and
   `zh` (the `satisfies Record<Locale, …>` and `TranslationKey` keep them in
   lockstep at compile time). Missing keys fall back to the default locale, then
   to the key itself.
3. **Add a locale** by extending the `Locale` union and adding its dictionary +
   a `locales` entry.
4. **Use `t()`**: `t("greeting.hello", { name })` interpolates `{name}`.

```tsx
const { t, locale, setLocale } = useTranslation();
<p>{t("greeting.welcome", { app: "Taoracle" })}</p>
```

(Only open a template if you need to customise it — copying it costs no context.)

## Foundation it assumes

React (context + hooks) only — no new dependencies. The demo also uses
`@/components/ui/{button,card,input,label}`, `@phosphor-icons/react`, and `cn`.

## Invariants

- SSR-safe: locale lives in component state; no `window`/`localStorage` at module
  top. (Persist to `localStorage` inside a `useEffect` if you want it sticky.)
- `en` and `zh` dictionaries stay key-for-key identical.
- Interpolation is `{var}` only; values are stringified.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — switch the locale and
confirm labels live-translate.
