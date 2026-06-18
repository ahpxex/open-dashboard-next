---
name: add-data-source
description: Back a resource with a different data source (REST or GraphQL instead of Postgres/Drizzle) by binding its server.ts to a different Repository adapter. Use when the data lives in an external API, not the local DB.
---

# Add / swap a data source

Every page archetype is written against the `Repository<T, TInput>` interface
(`src/infra/data/repository.ts`), so swapping backends touches only the
resource's `server.ts` binding. Full guide: `docs/data-adapters.md`.

## Adapters

- **Drizzle (Postgres)** — `drizzleRepository(table, config)` from
  `@/infra/data/drizzle-repository` (import directly; it is server-only).
  Backs `products`/`orders`.
- **REST** — `restRepository({ baseUrl, path, map, … })` from `@/infra/data`.
  Backs `posts` (jsonplaceholder). Defaults target json-server
  (`_page`/`_limit`/`_sort`/`_order`/`q` + `x-total-count`); override `params` /
  `totalHeader` for other shapes.
- **GraphQL** — `graphqlRepository({ endpoint, map, operations })` from
  `@/infra/data`. Each op supplies a document + variable builder + extractor.

## Steps

1. Define the resource's `Post`-style type + zod schemas (no DB table needed for
   REST/GraphQL).
2. In `server.ts`, build the repository with the right adapter and a `map` from
   the raw API record to your type. Wrap each op in a `createServerFn` handler
   that calls `requireUser()` (the fetch stays server-side, so API keys never
   reach the client).
3. Map the resource's flat list params to the repository's `filters`
   (`toListParams`). Filter params that can be numeric → `z.coerce.string()`.
4. Queries / table / card list / detail / form are unchanged.

## Invariants

- Adapters run only inside server fns. The `@/infra/data` barrel is
  isomorphic-safe (no `@/db`); the Drizzle adapter is imported from its own path.
- Always provide a unit test mocking the transport (fetch / db) — see
  `rest-repository.test.ts`, `graphql-repository.test.ts`, `drizzle-repository.test.ts`.

## Verify

`bun run typecheck && bun run check && bun run test`, then load `/<name>` and
confirm list/paginate/filter/search work against the backend.
