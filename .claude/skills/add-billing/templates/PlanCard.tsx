import { CheckIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Plan {
  id: string;
  name: string;
  /** Price in the smallest sensible unit you display, e.g. dollars/month. */
  price: number;
  cadence: string;
  description: string;
  features: string[];
  /** Highlight this plan (e.g. the recommended tier). */
  featured?: boolean;
}

/**
 * A single plan tier: name + price, a feature checklist, and a CTA that reads
 * "Current plan" (disabled) for the active tier or "Upgrade"/"Switch" otherwise.
 * Presentational — the parent owns which plan is current and the click handler.
 */
export function PlanCard({
  plan,
  current,
  onSelect,
}: {
  plan: Plan;
  current: boolean;
  onSelect: (planId: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border bg-card p-4",
        current
          ? "border-primary ring-1 ring-primary"
          : plan.featured
            ? "border-primary/40"
            : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-2 font-heading text-sm font-semibold text-foreground">
            {plan.name}
            {plan.featured && !current && (
              <Badge className="h-4 px-1.5 text-[10px]">Popular</Badge>
            )}
            {current && (
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                Current
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {plan.description}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
          ${plan.price}
        </span>
        <span className="text-xs text-muted-foreground">/{plan.cadence}</span>
      </div>

      <ul className="flex flex-col gap-1.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-xs text-foreground"
          >
            <CheckIcon size={14} className="shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant={current ? "outline" : plan.featured ? "default" : "secondary"}
        disabled={current}
        onClick={() => onSelect(plan.id)}
        className="mt-auto w-full"
      >
        {current ? "Current plan" : `Switch to ${plan.name}`}
      </Button>
    </div>
  );
}
