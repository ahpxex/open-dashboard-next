# Supabase frontend wiring (copy-ready)

These are the frontend-side seam implementations for the Supabase preset. They are
**not** carried in the scaffold base (they need the Supabase SDKs, which would bloat
every project that uses a different backend), so they ship here as copy-ready files.
The no-dep presets (`hono`, `fastapi`) instead live pre-wired and typechecked under the
base's `src/lib/auth-providers/`.

## Activate

```bash
bun add @supabase/supabase-js @supabase/ssr
```

Then copy these into the dashboard repo:

| This file | Copy to | Role |
| --- | --- | --- |
| `supabase-repository.ts` | `src/infra/data/supabase-repository.ts` | `Repository` adapter over supabase-js (`count:"exact"` for the total) |
| `products.server.ts` | `src/features/products/server.ts` | example resource binding (server-role key, snake↔camel map) |
| `auth-provider.ts` | `src/lib/auth-providers/supabase.ts` | `AuthProvider.getSession` via `@supabase/ssr` + `getUser()` |
| `auth-client.ts` | `src/lib/auth-clients/supabase.ts` | browser client mirroring the better-auth surface |

Wire the seams:

```ts
// src/lib/auth-provider.ts
import { supabaseAuthProvider } from "@/lib/auth-providers/supabase";
export const authProvider: AuthProvider = supabaseAuthProvider;

// src/lib/auth-client.ts
export * from "@/lib/auth-clients/supabase";
```

Set env (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` server-side;
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for the browser client). See
`../.env.example` and the contract in `../README.md`.

> These files import the Supabase SDKs, so they are typechecked in isolation (against
> the real `@supabase/*` types) rather than by the base repo's `bun run typecheck`.
> Full end-to-end verification needs the Supabase stack (`supabase start`) — see
> `../README.md`.
