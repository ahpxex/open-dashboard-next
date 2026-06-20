import { TrayIcon, WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type State = "loading" | "empty" | "error" | "ready";

/**
 * A single async-state surface for list/detail bodies. `loading` shows skeleton
 * rows, `empty` a centered icon + message, `error` a destructive alert — each
 * with an optional action button. `ready` passes `children` straight through.
 */
export function StateView({
  state,
  title,
  description,
  action,
  children,
}: {
  state: State;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}) {
  if (state === "loading") {
    return (
      <div className="flex flex-col gap-2" aria-busy="true">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3">
            <Skeleton className="size-8 shrink-0" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <TrayIcon className="size-8 text-muted-foreground" weight="duotone" />
        <p className="text-sm font-medium text-foreground">
          {title ?? "Nothing here yet"}
        </p>
        {description && (
          <p className="max-w-xs text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {action && (
          <Button size="sm" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  if (state === "error") {
    return (
      <Alert variant="destructive" role="alert" aria-live="assertive">
        <WarningCircleIcon weight="fill" />
        <AlertTitle>{title ?? "Something went wrong"}</AlertTitle>
        {description && <AlertDescription>{description}</AlertDescription>}
        {action && (
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </Alert>
    );
  }

  return <>{children}</>;
}
