import {
  GearIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;
  const displayName = user?.name || user?.email || "User";

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    navigate({ to: "/login" });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 rounded-none py-1">
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {displayName}
            </span>
            {isPending ? (
              <Spinner />
            ) : (
              <Avatar size="sm">
                <AvatarImage src={user?.image ?? undefined} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user?.email ?? "Account"}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
            <GearIcon size={18} />
            <div className="flex flex-col">
              <span>Settings</span>
              <span className="text-xs text-muted-foreground">
                Manage your account
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            {resolvedTheme === "dark" ? (
              <SunIcon size={18} />
            ) : (
              <MoonIcon size={18} />
            )}
            <div className="flex flex-col">
              <span>Toggle theme</span>
              <span className="text-xs text-muted-foreground">
                Switch light / dark
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          <SignOutIcon size={18} />
          <div className="flex flex-col">
            <span>Sign out</span>
            <span className="text-xs text-muted-foreground">
              End your session
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
