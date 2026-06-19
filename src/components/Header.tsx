import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCommandMenu } from "@/stores/command-menu";
import { UserAvatar } from "./UserAvatar";

export function Header() {
  const { open } = useCommandMenu();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex flex-1 items-center gap-3">
          <SidebarTrigger className="-ml-2 shrink-0" />
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            onClick={open}
            className="h-10 w-full max-w-md justify-start gap-3 px-4 text-sm font-normal text-muted-foreground"
          >
            <MagnifyingGlassIcon size={18} className="text-muted-foreground" />
            <span className="flex-1 text-left">Search</span>
            <Kbd>⌘K</Kbd>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar />
        </div>
      </div>
    </header>
  );
}
