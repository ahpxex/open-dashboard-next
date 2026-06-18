"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Kbd } from "@/components/ui/kbd";
import {
  type CommandMenuItemConfig,
  commandMenuGroups,
} from "@/lib/command-menu-items";
import { bottomMenuItems, mainMenuItems } from "@/lib/sidebar-items";

const GROUP_BASE_CLASS =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400";
const BASE_ITEM_CLASSES =
  "relative flex cursor-pointer select-none items-center rounded-none px-3 py-2.5 text-sm outline-none transition-colors data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";
const NEUTRAL_ITEM_CLASSES = `${BASE_ITEM_CLASSES} data-[selected=true]:bg-gray-100 dark:data-[selected=true]:bg-gray-800`;
const DANGER_ITEM_CLASSES = `${BASE_ITEM_CLASSES} data-[selected=true]:bg-red-50 dark:data-[selected=true]:bg-red-950/20`;

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange]);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  const handleItemSelect = useCallback(
    (item: CommandMenuItemConfig) => {
      if (item.href) {
        router.push(item.href);
        return;
      }

      if (item.action === "toggleTheme") {
        console.log("Toggle theme");
      }
    },
    [router],
  );

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Command Menu */}
      <Command.Dialog
        open={open}
        onOpenChange={onOpenChange}
        label="Global Command Menu"
        className="fixed left-[50%] top-[30%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-30%] animate-in fade-in-90 slide-in-from-bottom-10"
      >
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <div className="overflow-hidden rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-800 px-4">
            <MagnifyingGlassIcon
              size={20}
              className="text-gray-400 dark:text-gray-500"
            />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="flex h-14 w-full bg-transparent px-4 text-sm text-foreground placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <Kbd className="hidden sm:inline-flex">Esc</Kbd>
          </div>

          {/* Command List */}
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found.
            </Command.Empty>

            {/* Navigation Section */}
            <Command.Group
              heading="Navigation"
              className="mb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400"
            >
              {[
                ...mainMenuItems.flatMap((group) => group.items),
                ...bottomMenuItems,
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.label}
                    value={item.label}
                    onSelect={() => runCommand(() => router.push(item.href))}
                    className={NEUTRAL_ITEM_CLASSES}
                  >
                    <Icon
                      size={18}
                      className="mr-3 text-gray-600 dark:text-gray-400"
                    />
                    <span className="text-foreground">{item.label}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                      Go to {item.label.toLowerCase()}
                    </span>
                  </Command.Item>
                );
              })}
            </Command.Group>

            {commandMenuGroups.map((group, index) => {
              const groupClassName =
                index !== commandMenuGroups.length - 1
                  ? `mb-2 ${GROUP_BASE_CLASS}`
                  : GROUP_BASE_CLASS;

              return (
                <Command.Group
                  key={group.key}
                  heading={group.label}
                  className={groupClassName}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isDanger = item.tone === "danger";
                    const iconColor = isDanger
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400";
                    const labelClass = isDanger
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground";
                    const descriptionClass = isDanger
                      ? "ml-auto text-xs text-red-400 dark:text-red-500"
                      : "ml-auto text-xs text-gray-400 dark:text-gray-500";
                    const itemClasses = isDanger
                      ? DANGER_ITEM_CLASSES
                      : NEUTRAL_ITEM_CLASSES;

                    return (
                      <Command.Item
                        key={item.key}
                        value={item.label}
                        onSelect={() =>
                          runCommand(() => handleItemSelect(item))
                        }
                        className={itemClasses}
                      >
                        <Icon size={18} className={`mr-3 ${iconColor}`} />
                        <span className={labelClass}>{item.label}</span>
                        {item.shortcut ? (
                          <Kbd className="ml-auto hidden sm:inline-flex">
                            ⌘{item.shortcut.label}
                          </Kbd>
                        ) : item.description ? (
                          <span className={descriptionClass}>
                            {item.description}
                          </span>
                        ) : null}
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              );
            })}
          </Command.List>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Navigate with arrow keys</span>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1">
                  Open
                  <Kbd>⌘K</Kbd>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  Close
                  <Kbd>Esc</Kbd>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}
