import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { appConfig } from "@/config/app";
import { getSession } from "@/lib/auth-server";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center">
          <span className="text-lg font-semibold tracking-tight">
            {appConfig.name}
          </span>
        </div>
        <Outlet />
      </div>
    </main>
  );
}
