import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandMenuProvider } from "./CommandMenuProvider";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider className="h-svh">
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <Header />
          {/* Content region: a definite-height, scrollable flex column. The
              `min-h-0` lets it shrink inside the viewport-tall shell so a
              full-height page (`flex h-full flex-col`) can pin its footer —
              e.g. a DataTable's pagination bar — to the bottom. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <CommandMenuProvider />
    </TooltipProvider>
  );
}
