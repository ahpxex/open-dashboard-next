import {
  BellIcon,
  InfoIcon,
  SlidersIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StateView } from "@/components/feedback/StateView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/feedback")({
  component: FeedbackDemo,
});

const STATES = ["loading", "empty", "error"] as const;
type PreviewState = (typeof STATES)[number];

const STATE_LABEL: Record<PreviewState, string> = {
  loading: "Loading",
  empty: "Empty",
  error: "Error",
};

/**
 * Gallery demo: feedback & overlay blocks — a side drawer (Sheet), the StateView
 * surface across its loading/empty/error states with a switcher, inline alert
 * banners, and a toast trigger.
 */
function FeedbackDemo() {
  const [preview, setPreview] = useState<PreviewState>("loading");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Feedback &amp; overlays
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Surfaces for async state, transient notices, and side panels — a
          drawer, the StateView component, inline banners, and toasts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Side drawer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              A Sheet slides in from the edge for secondary flows — filters,
              details, quick edits.
            </p>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />}>
                <SlidersIcon />
                Open panel
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter results</SheetTitle>
                  <SheetDescription>
                    Adjust the view, then apply. Changes stay local until you
                    confirm.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-3 px-4 text-xs">
                  <p className="text-muted-foreground">
                    Drawer body — drop any content here: forms, a record
                    summary, or a list of options.
                  </p>
                  <Separator />
                  <ul className="flex flex-col gap-2">
                    <li>Status: Active</li>
                    <li>Owner: Unassigned</li>
                    <li>Updated: Last 7 days</li>
                  </ul>
                </div>
                <SheetFooter>
                  <SheetClose render={<Button size="sm" />}>
                    Apply filters
                  </SheetClose>
                  <SheetClose render={<Button variant="outline" size="sm" />}>
                    Cancel
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Toast</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Fire-and-forget confirmation for completed actions.
            </p>
            <div>
              <Button size="sm" onClick={() => toast.success("Changes saved")}>
                <BellIcon />
                Show success toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">State view</CardTitle>
          <div className="flex gap-1">
            {STATES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={preview === s ? "default" : "outline"}
                onClick={() => setPreview(s)}
              >
                {STATE_LABEL[s]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            One surface for every async outcome. Switch the preview above to see
            each state.
          </p>
          <div className="rounded-none border border-border p-4">
            <StateView
              state={preview}
              title={
                preview === "empty"
                  ? "No results"
                  : preview === "error"
                    ? "Couldn’t load data"
                    : undefined
              }
              description={
                preview === "empty"
                  ? "Try adjusting your filters or add the first record."
                  : preview === "error"
                    ? "The request failed. Check your connection and retry."
                    : undefined
              }
              action={
                preview === "empty"
                  ? {
                      label: "Add record",
                      onClick: () => toast.success("New record"),
                    }
                  : preview === "error"
                    ? {
                        label: "Retry",
                        onClick: () => toast.success("Retrying…"),
                      }
                    : undefined
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inline banners</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert>
            <InfoIcon weight="fill" />
            <AlertTitle>Scheduled maintenance</AlertTitle>
            <AlertDescription>
              The platform will be read-only on Sunday from 02:00–03:00 UTC.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <WarningIcon weight="fill" />
            <AlertTitle>Payment failed</AlertTitle>
            <AlertDescription>
              We couldn’t charge your card. Update your billing details to avoid
              interruption.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
