/**
 * Child-process fixture for the DATA_API_TOKEN guard test (spawned by
 * contract.test.ts). The guard reads DATA_API_TOKEN at module-load time (env.ts
 * centralises env resolution), so the *only* faithful way to exercise the gated
 * posture without disturbing the other tests — which run with no token set — is a
 * fresh process whose environment carries the token before any import.
 *
 * The parent spawns this with `DATA_API_TOKEN` + `SQLITE_PATH=./test.db` set. It
 * boots the real Hono app and runs two requests against the live `/products`
 * route, printing `OK` on success or `FAIL: …` otherwise; exit code mirrors it.
 */
export {};

const TOKEN = process.env.DATA_API_TOKEN ?? "";

// Quiet better-auth's baseURL warning noise on the child's stderr.
process.env.NODE_ENV = "test";
process.env.BETTER_AUTH_SECRET ||= "test-secret-not-for-production";
process.env.FRONTEND_ORIGIN = "http://localhost:3000";

const { app } = await import("../src/app");

function req(path: string, init?: RequestInit) {
  return app.request(new Request(`http://localhost${path}`, init));
}

function fail(message: string): never {
  console.log(`FAIL: ${message}`);
  process.exit(1);
}

// 1) WITHOUT the bearer => 401 { error: "Unauthorized" }.
const noAuth = await req("/products");
if (noAuth.status !== 401) {
  fail(`no-bearer expected 401, got ${noAuth.status}`);
}
const noAuthBody = (await noAuth.json().catch(() => ({}))) as { error?: string };
if (noAuthBody.error !== "Unauthorized") {
  fail(`no-bearer expected { error: "Unauthorized" }, got ${JSON.stringify(noAuthBody)}`);
}

// 2) WITH the correct bearer => succeeds (200 + X-Total-Count present).
const withAuth = await req("/products", {
  headers: { authorization: `Bearer ${TOKEN}` },
});
if (withAuth.status !== 200) {
  fail(`with-bearer expected 200, got ${withAuth.status}`);
}
if (!withAuth.headers.get("X-Total-Count")) {
  fail("with-bearer expected an X-Total-Count header");
}

console.log("OK");
process.exit(0);
