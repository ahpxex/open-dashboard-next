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
          <div className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <CommandMenuProvider />
    </TooltipProvider>
  );
}
