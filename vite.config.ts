import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import viteTsConfigPaths from "vite-tsconfig-paths";

// `DEPLOY_TARGET=cloudflare` builds for the Cloudflare Workers runtime via the
// official @cloudflare/vite-plugin (config in wrangler.jsonc). The default build
// targets a Node server via Nitro — `bun run build` / `bun run start` unchanged.
const isCloudflare = process.env.DEPLOY_TARGET === "cloudflare";

// `pg`'s optional native client can't be bundled for workerd. Safe to stub: the
// Cloudflare demo build bypasses auth/db (VITE_SKIP_AUTH), so pg never executes.
const pgNativeStub = fileURLToPath(
  new URL("./src/lib/stubs/pg-native.cjs", import.meta.url),
);

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: isCloudflare ? { "pg-native": pgNativeStub } : {},
  },
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // Cloudflare plugin must precede tanstackStart so Start targets the Workers
    // runtime (and provides AsyncLocalStorage for server functions during SSR).
    ...(isCloudflare ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
    tanstackStart(),
    ...(isCloudflare ? [] : [nitroV2Plugin({ preset: "node-server" })]),
    viteReact(),
    devtoolsJson(),
  ],
});
