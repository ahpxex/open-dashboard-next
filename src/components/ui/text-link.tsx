import { createLink } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const StyledLink = createLink((props: ComponentProps<"a">) => <a {...props} />);

/**
 * Inline text link styled to match the design system, wired to the
 * TanStack Router link so it gets prefetching + typed routes.
 */
export function TextLink({
  className,
  ...props
}: ComponentProps<typeof StyledLink>) {
  return (
    <StyledLink
      className={cn(
        "font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80",
        className,
      )}
      {...props}
    />
  );
}
