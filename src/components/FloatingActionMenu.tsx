"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ButtonVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost";

export interface FloatingAction {
  key: string;
  label: string;
  icon: ReactNode;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: ButtonVariant;
  onClick: () => void | Promise<void>;
}

export interface FloatingActionMenuProps {
  selectedCount: number;
  onClear: () => void;
  actions: FloatingAction[];
  show?: boolean;
}

function resolveVariant(action: FloatingAction): ButtonVariant {
  if (action.variant) {
    return action.variant;
  }
  if (action.color === "danger") {
    return "destructive";
  }
  if (action.color === "primary") {
    return "default";
  }
  return "secondary";
}

export function FloatingActionMenu({
  selectedCount,
  onClear,
  actions,
  show = true,
}: FloatingActionMenuProps) {
  if (!show || selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className="py-2.5 shadow-2xl">
        <CardContent className="flex flex-row items-center gap-3 px-4">
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <span className="text-sm font-semibold text-foreground">
              {selectedCount}
            </span>
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            {actions.map((action) => (
              <Button
                key={action.key}
                size="sm"
                variant={resolveVariant(action)}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
