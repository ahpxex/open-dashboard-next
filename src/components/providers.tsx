import { ThemeProvider } from "next-themes";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import { appConfig } from "@/config/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={appConfig.theme.defaultTheme}
      enableSystem={appConfig.theme.enableSystem}
      disableTransitionOnChange
    >
      <ConfirmProvider>{children}</ConfirmProvider>
      <Toaster />
    </ThemeProvider>
  );
}
