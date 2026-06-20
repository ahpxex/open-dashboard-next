---
name: add-auth-method
description: Add extra sign-in methods on top of email/password — social OAuth (GitHub/Google) and a passwordless magic link — via better-auth. Ships a drop-in SocialButtons component and a demo catalogue. Use when login needs more than a password.
---

# Add sign-in methods (social + magic link)

Email + password already works (`src/lib/auth.ts`, `src/routes/_auth/login.tsx`).
This layers on social OAuth and a magic link. The pieces are **bundled** — copy,
don't paste:

- `templates/SocialButtons.tsx` → `src/components/auth/SocialButtons.tsx` — the
  drop-in "Continue with GitHub/Google" buttons; calls
  `authClient.signIn.social({ provider })` and toasts gracefully if a provider
  isn't configured.
- `templates/auth-methods.tsx` → `src/routes/_app/gallery/auth-methods.tsx` — the
  demo (social buttons + a magic-link request form, UI only).

## Add it

```bash
cp .claude/skills/add-auth-method/templates/SocialButtons.tsx src/components/auth/SocialButtons.tsx
```

### 1. Drop social buttons onto the login page

In `src/routes/_auth/login.tsx`, render `<SocialButtons />` under the
password form with a divider:

```tsx
import { SocialButtons } from "@/components/auth/SocialButtons";
// …inside CardFooter, after the Sign in button:
<div className="flex items-center gap-2 text-xs text-muted-foreground">
  <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
</div>
<SocialButtons callbackURL="/" />
```

### 2. Enable providers in `src/lib/auth.ts`

```ts
export const auth = betterAuth({
  // …existing config…
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Insert plugins above the `auth-plugins:anchor` line in src/lib/auth.ts so
  // tanstackStartCookies() stays last; multiple auth skills can then stack
  // deterministically instead of hand-merging the array.
  plugins: [
    magicLink({ sendMagicLink: async ({ email, url }) => { /* email it */ } }),
    // auth-plugins:anchor (keep tanstackStartCookies last)
    tanstackStartCookies(),
  ],
});
```

Set the OAuth keys (`GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`) in
`.env`; register each provider's callback as
`<BETTER_AUTH_URL>/api/auth/callback/<provider>`.

### 3. Magic link

`import { magicLink } from "better-auth/plugins"`, add `magicLink({ … })` to
`plugins` (its `sendMagicLink` callback emails the `url` via your provider), and
call `authClient.signIn.magicLink({ email, callbackURL: "/" })` from the form.
The magic-link plugin adds a `verification` model — already present in the
in-memory store; with Postgres re-run `bun run db:generate && bun run db:migrate`.

(Only open a template if you need to customise it — copying costs no context.)

## Foundation it assumes

`@/lib/auth-client` (`authClient`), `@/lib/auth.ts` (better-auth), the auth
routes under `src/routes/_auth/*`, `@/components/ui/{button,card,input,label,alert,separator}`,
`@/lib/toast`, and `@phosphor-icons/react`.

## Invariants

- **`tanstackStartCookies()` MUST stay the LAST plugin** in `plugins` (it flushes
  `Set-Cookie`) — insert `magicLink()` (and any other plugin) above the
  `// auth-plugins:anchor` line in `src/lib/auth.ts`, never after the cookies plugin.
- Each in-memory model a plugin needs must exist in `memoryStore` in
  `src/lib/auth.ts` (`verification` is already there).
- The browser only ever talks to `authClient` (`@/lib/auth-client`) — never import
  `@/lib/auth` from a client-reachable module.
- Providers fail closed without keys: `SocialButtons` toasts instead of throwing,
  so the login page stays usable in zero-config dev.

## Verify

`bun run typecheck && bun run check`, then `bun run dev` — open
`/gallery/auth-methods`; the social buttons toast a friendly message (no keys
yet) and the magic-link form toasts "link sent". With keys set, GitHub/Google
redirect through OAuth.
