import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DescriptionList } from "@/infra/ui";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/profile")({
  component: ProfileDemo,
});

interface PersonalInfo {
  fullName: string;
  email: string;
  jobTitle: string;
  location: string;
}

const INITIAL: PersonalInfo = {
  fullName: "Avery Quinn",
  email: "avery.quinn@example.com",
  jobTitle: "Product Designer",
  location: "San Francisco, CA",
};

/**
 * Profile / account page. Gallery demo: a header card with avatar, name and
 * role; an editable "Personal info" section backed by local state that reports
 * a toast on save; and a read-only "Account" DescriptionList.
 */
function ProfileDemo() {
  const [info, setInfo] = useState<PersonalInfo>(INITIAL);

  function update<K extends keyof PersonalInfo>(
    key: K,
    value: PersonalInfo[K],
  ) {
    setInfo((prev) => ({ ...prev, [key]: value }));
  }

  function onSave(event: React.FormEvent) {
    event.preventDefault();
    toast.success("Profile updated");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Profile / account
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A personal account screen: identity header, an editable info form, and
          a read-only account summary.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar size="lg">
            <AvatarImage
              src="https://i.pravatar.cc/96?img=12"
              alt="Avery Quinn"
            />
            <AvatarFallback>AQ</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">
                {info.fullName}
              </span>
              <Badge variant="secondary">{info.jobTitle}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">{info.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal info</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="full-name">Full name</Label>
                <Input
                  id="full-name"
                  value={info.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={info.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="job-title">Job title</Label>
                <Input
                  id="job-title"
                  value={info.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={info.location}
                  onChange={(e) => update("location", e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInfo(INITIAL)}
              >
                Reset
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList
            columns={2}
            items={[
              { label: "User ID", value: "usr_8f12c4a9" },
              { label: "Plan", value: "Pro" },
              { label: "Role", value: "Administrator" },
              { label: "Two-factor", value: "Enabled (authenticator app)" },
              { label: "Member since", value: "2024-09-03" },
              { label: "Last sign-in", value: "2026-06-18 08:24" },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
