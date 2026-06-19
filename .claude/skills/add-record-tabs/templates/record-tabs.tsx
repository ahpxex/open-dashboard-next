import {
  ClockIcon,
  GearSixIcon,
  InfoIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DescriptionList } from "@/infra/ui";

const tabSchema = z.object({
  tab: z.enum(["overview", "activity", "settings"]).default("overview"),
});

export const Route = createFileRoute("/_app/gallery/record-tabs")({
  validateSearch: tabSchema,
  component: RecordTabsDemo,
});

const ACTIVITY: {
  id: string;
  icon: typeof InfoIcon;
  text: string;
  at: string;
}[] = [
  {
    id: "a1",
    icon: PencilSimpleIcon,
    text: "Avery Quinn updated the billing plan to Scale.",
    at: "2026-05-12 09:41",
  },
  {
    id: "a2",
    icon: InfoIcon,
    text: "Seat count increased from 18 to 24.",
    at: "2026-05-09 16:08",
  },
  {
    id: "a3",
    icon: ClockIcon,
    text: "Trial converted to a paid subscription.",
    at: "2026-04-30 11:22",
  },
  {
    id: "a4",
    icon: GearSixIcon,
    text: "SSO enforced for all members.",
    at: "2026-04-18 14:55",
  },
];

/**
 * Tabbed record detail with the active tab synced to the URL search param
 * (`?tab=…`). Gallery demo: controlled `Tabs`, deep-linkable and back-button
 * friendly, with a DescriptionList overview, an activity feed, and toggles.
 */
function RecordTabsDemo() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [emailDigest, setEmailDigest] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Tabbed record (URL-synced)
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A record detail split across tabs, with the active tab kept in the URL
          (<code className="font-mono text-xs">?tab=…</code>) so it's
          deep-linkable and survives the back button.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Northwind Labs</h2>
        <Badge
          variant="outline"
          className="border-transparent bg-green-500/15 text-green-700 dark:text-green-400"
        >
          Active
        </Badge>
        <span className="font-mono text-xs text-muted-foreground">
          ACC-4821
        </span>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({
            search: { tab: value as "overview" | "activity" | "settings" },
          })
        }
      >
        <TabsList className="w-fit">
          <TabsTrigger value="overview">
            <InfoIcon />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity">
            <ClockIcon />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <GearSixIcon />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="border border-border p-6">
            <DescriptionList
              columns={3}
              items={[
                { label: "Account owner", value: "Avery Quinn" },
                { label: "Plan", value: "Scale (annual)" },
                { label: "Seats", value: "24 of 40" },
                { label: "Region", value: "US-East" },
                { label: "MRR", value: "$4,800" },
                { label: "Renewal", value: "2027-04-30" },
                {
                  label: "Notes",
                  value:
                    "Strategic account; expansion review scheduled for Q3. Primary contact prefers async updates over calls.",
                  full: true,
                },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <ul className="flex flex-col gap-4 border border-border p-6">
            {ACTIVITY.map((event) => {
              const Icon = event.icon;
              return (
                <li key={event.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                    <Icon size={14} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm">{event.text}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {event.at}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account preferences</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="email-digest" className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Weekly email digest
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Send a usage summary every Monday morning.
                  </span>
                </Label>
                <Switch
                  id="email-digest"
                  checked={emailDigest}
                  onCheckedChange={(value) => setEmailDigest(value)}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="auto-renew" className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Auto-renew</span>
                  <span className="text-xs text-muted-foreground">
                    Automatically renew the subscription at the end of the term.
                  </span>
                </Label>
                <Switch
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={(value) => setAutoRenew(value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
