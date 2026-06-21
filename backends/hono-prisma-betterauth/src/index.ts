/**
 * Server bootstrap. Ensures the dev seed has run, then serves the Hono app on
 * `PORT` (default 8788) using Bun's built-in server.
 *
 * Tables are created by `prisma db push` (run by the predev/prestart scripts
 * before this module executes), so there is no manual migrate step for the
 * zero-config SQLite path.
 *
 * Run with `bun run dev` (hot reload) or `bun run start`.
 */
import { app } from "./app";
import { frontendOrigin, hasDatabase, port } from "./lib/env";
import { seedDev } from "./lib/seed";

await seedDev();

const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(
  `[hono-prisma-betterauth] listening on http://localhost:${server.port}`,
);
console.log(
  `  backend: ${hasDatabase ? "Postgres (DATABASE_URL)" : "SQLite (zero-config)"}`,
);
console.log(`  trusted frontend origin: ${frontendOrigin}`);
