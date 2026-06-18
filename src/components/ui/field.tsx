import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Lightweight labeled field wrapper. Replaces HeroUI's built-in `label`,
 * `description`, and `errorMessage` props on inputs/selects/textareas.
 */
export function Field({
  label,
  htmlFor,
  required,
  description,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor}>
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <div className="text-xs text-destructive">{error}</div>
      ) : description ? (
        <div className="text-xs text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
