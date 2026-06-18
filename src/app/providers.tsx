"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { registerExampleResources } from "@/examples/_registry";
import { exampleResources } from "@/examples/resources";
import { authProvider, refineDataProvider } from "@/infra/refine";

// Register example resources on module load
registerExampleResources();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={refineDataProvider}
      authProvider={authProvider}
      resources={exampleResources}
      options={{
        // Note: syncWithLocation requires Suspense boundaries in Next.js 15
        // due to useSearchParams usage. Set to false for static builds.
        syncWithLocation: false,
        warnWhenUnsavedChanges: true,
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}
