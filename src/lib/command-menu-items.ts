import {
  BellIcon,
  MoonIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

export type CommandMenuIcon = ComponentType<{
  size?: number;
  className?: string;
}>;

export type CommandMenuShortcut = {
  keys: string[];
  label: string;
};

export interface CommandMenuItemConfig {
  key: string;
  label: string;
  description?: string;
  icon: CommandMenuIcon;
  href?: string;
  action?: "toggleTheme";
  shortcut?: CommandMenuShortcut;
  tone?: "danger";
}

export interface CommandMenuGroupConfig {
  key: string;
  label: string;
  items: CommandMenuItemConfig[];
}

export const commandMenuGroups: CommandMenuGroupConfig[] = [
  {
    key: "account",
    label: "Account",
    items: [
      {
        key: "profile",
        label: "Profile",
        description: "View your profile",
        icon: UserIcon,
        href: "/profile",
      },
      {
        key: "notifications",
        label: "Notifications",
        description: "View notifications",
        icon: BellIcon,
        href: "/notifications",
      },
    ],
  },
  {
    key: "preferences",
    label: "Preferences",
    items: [
      {
        key: "toggle-theme",
        label: "Toggle Theme",
        description: "Toggle dark mode",
        icon: MoonIcon,
        action: "toggleTheme",
        shortcut: {
          keys: ["command"],
          label: "T",
        },
      },
    ],
  },
  {
    key: "actions",
    label: "Actions",
    items: [
      {
        key: "logout",
        label: "Logout",
        description: "Sign out",
        icon: SignOutIcon,
        href: "/login",
        tone: "danger",
      },
    ],
  },
];
