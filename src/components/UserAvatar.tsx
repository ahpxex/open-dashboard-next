"use client";

import {
  BellIcon,
  GearIcon,
  MoonIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
import type { SessionUser } from "@/lib/auth/session";

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
  const router = useRouter();
  const { data: identity, isLoading: isIdentityLoading } =
    useGetIdentity<SessionUser>();
  const { mutateAsync: logout } = useLogout();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    if (signOutError) {
      console.error("[auth] Sign out failed:", signOutError);
    }
  }, [signOutError]);

  const displayName = useMemo(() => {
    if (identity?.name) {
      return identity.name;
    }
    return identity?.email ?? "User";
  }, [identity]);

  const avatarSrc = undefined;

  const handleAction = async (key: string) => {
    switch (key) {
      case "profile":
        router.push("/profile");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "notifications":
        router.push("/notifications");
        break;
      case "theme":
        // Toggle theme logic here
        break;
      case "logout":
        try {
          setIsSigningOut(true);
          setSignOutError(null);
          const response = await logout();
          if (response?.success === false) {
            setSignOutError(
              response.error?.message ||
                "Unable to sign out. Please try again.",
            );
            return;
          }
          router.push("/login");
          router.refresh();
        } catch (error: any) {
          setSignOutError(
            error.message ?? "Unable to sign out. Please try again.",
          );
        } finally {
          setIsSigningOut(false);
        }
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="h-auto gap-2 rounded-none py-1">
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {displayName}
            </span>
            {isIdentityLoading ? (
              <Spinner />
            ) : (
              <Avatar size="sm">
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
              </Avatar>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleAction("profile")}>
            <UserIcon size={18} />
            <div className="flex flex-col">
              <span>Profile</span>
              <span className="text-xs text-muted-foreground">
                View your profile
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("settings")}>
            <GearIcon size={18} />
            <div className="flex flex-col">
              <span>Settings</span>
              <span className="text-xs text-muted-foreground">
                Manage your settings
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("notifications")}>
            <BellIcon size={18} />
            <div className="flex flex-col">
              <span>Notifications</span>
              <span className="text-xs text-muted-foreground">
                View notifications
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleAction("theme")}>
            <MoonIcon size={18} />
            <div className="flex flex-col">
              <span>Theme</span>
              <span className="text-xs text-muted-foreground">
                Toggle dark mode
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => handleAction("logout")}
        >
          <SignOutIcon size={18} />
          <div className="flex flex-col">
            <span>Logout</span>
            <span className="text-xs text-muted-foreground">
              Sign out of your account
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
