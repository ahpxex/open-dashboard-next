/**
 * Server bootstrap. Ensures the dev seed has run, then serves the Hono app on
 * `PORT` (default 8787) using Bun's built-in server.
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
  `[hono-drizzle-betterauth] listening on http://localhost:${server.port}`,
);
console.log(
  `  backend: ${hasDatabase ? "Postgres (DATABASE_URL)" : "SQLite (zero-config)"}`,
);
console.log(`  trusted frontend origin: ${frontendOrigin}`);
