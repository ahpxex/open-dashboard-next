import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Inline text link styled to match the design system. Replaces HeroUI's
 * `<Link>` for in-content links.
 */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80",
        className,
      )}
      {...props}
    />
  );
}
