"use client";

import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  className?: string;
  onPress: () => void;
}

export interface ActionMenuProps {
  items?: ActionMenuItem[];
  onEdit?: () => void;
  onDelete?: () => void;
  ariaLabel?: string;
}

/**
 * Reusable action menu dropdown.
 * Can use default edit/delete actions or provide custom items.
 *
 * @example
 * ```tsx
 * // Default edit/delete
 * <ActionMenu onEdit={() => {}} onDelete={() => {}} />
 *
 * // Custom items
 * <ActionMenu items={[
 *   { key: "view", label: "View", onPress: () => {} },
 *   { key: "edit", label: "Edit", icon: <PencilSimple />, onPress: () => {} },
 * ]} />
 * ```
 */
export function ActionMenu({
  items,
  onEdit,
  onDelete,
  ariaLabel = "Actions",
}: ActionMenuProps) {
  const menuItems: ActionMenuItem[] = items ?? [
    ...(onEdit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <PencilSimple size={18} />,
            onPress: onEdit,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash size={18} />,
            color: "danger" as const,
            onPress: onDelete,
          },
        ]
      : []),
  ];

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={ariaLabel}>
            <DotsThreeVertical size={18} weight="bold" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" aria-label={ariaLabel}>
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.key}
            variant={item.color === "danger" ? "destructive" : "default"}
            className={item.className}
            onClick={item.onPress}
          >
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
