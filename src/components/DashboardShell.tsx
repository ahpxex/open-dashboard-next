"use client";

import { Authenticated } from "@refinedev/core";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Authenticated
      key="dashboard"
      loading={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Checking your session…</p>
        </div>
      }
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-muted-foreground">Redirecting to login…</p>
        </div>
      }
    >
      <TooltipProvider delay={0}>
        <SidebarProvider className="h-svh">
          <AppSidebar />
          <SidebarInset className="overflow-hidden">
            <Header />
            <div className="flex flex-1 flex-col overflow-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </Authenticated>
  );
}
