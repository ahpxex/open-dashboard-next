import { createFileRoute } from "@tanstack/react-router";
import { MetadataList } from "@/components/data/MetadataList";
import { ProgressTile } from "@/components/data/ProgressTile";
import { TagList } from "@/components/data/TagList";
import { UserCell } from "@/components/data/UserCell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/gallery/data-display")({
  component: DataDisplayDemo,
});

const TAGS = ["design", "frontend", "urgent", "q3", "billing", "internal"];

const PEOPLE = [
  { name: "Ada Lovelace", email: "ada@analytical.co" },
  { name: "Grace Hopper", email: "grace@navy.mil" },
  { name: "Alan Turing", email: "alan@bletchley.uk" },
];

const META = [
  { label: "Status", value: <Badge variant="secondary">Active</Badge> },
  { label: "Plan", value: "Enterprise" },
  { label: "Seats", value: "48 / 50" },
  { label: "Region", value: "eu-west-1" },
  { label: "Created", value: "2024-11-02" },
];

const PROGRESS = [
  { label: "Onboarding", value: 18, total: 24 },
  { label: "Storage used", value: 412, total: 512 },
  { label: "API quota", value: 7300, total: 10000 },
];

/**
 * Gallery demo: the four reusable data-display blocks (TagList, MetadataList,
 * ProgressTile, UserCell), each in its own card, fed deterministic sample data.
 */
function DataDisplayDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Data display blocks
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Small, reusable presentation components — tags, key/value metadata,
          metric tiles, and identity cells — for tables and detail panels.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tag list</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Wrapping badges for labels and categories.
            </p>
            <TagList tags={TAGS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata list</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              A compact key/value grid for record attributes.
            </p>
            <MetadataList items={META} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress tiles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Metric tiles with a value/total ratio and percent.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PROGRESS.map((p) => (
                <ProgressTile
                  key={p.label}
                  label={p.label}
                  value={p.value}
                  total={p.total}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">User cells</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              An initials avatar with name over a muted email.
            </p>
            <div className="flex flex-col gap-3">
              {PEOPLE.map((person) => (
                <UserCell
                  key={person.email}
                  name={person.name}
                  email={person.email}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
