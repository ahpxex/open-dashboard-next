import { BellIcon, EyeIcon, PaletteIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/lib/toast";

export const Route = createFileRoute("/_app/gallery/control-page")({
  component: ControlPageDemo,
});

interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestFrequency: "daily" | "weekly" | "never";
  profileVisibility: "public" | "team" | "private";
  searchIndexing: boolean;
  theme: "system" | "light" | "dark";
  density: "comfortable" | "compact";
}

const DEFAULTS: Settings = {
  emailNotifications: true,
  pushNotifications: false,
  digestFrequency: "weekly",
  profileVisibility: "team",
  searchIndexing: true,
  theme: "system",
  density: "comfortable",
};

const visibilityOptions: {
  value: Settings["profileVisibility"];
  label: string;
}[] = [
  { value: "public", label: "Everyone" },
  { value: "team", label: "Team only" },
  { value: "private", label: "Only me" },
];

/**
 * Settings / control page. Gallery demo: grouped sections of toggles, selects
 * and radios; edits are tracked in local state and a sticky "Save changes" bar
 * appears only while the form is dirty. Save reports a toast and clears dirty.
 */
function ControlPageDemo() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [saved, setSaved] = useState<Settings>(DEFAULTS);
  // The Theme control maps to a real platform capability (next-themes), so wire
  // it for real instead of leaving it decorative.
  const { setTheme } = useTheme();

  const dirty = (Object.keys(settings) as (keyof Settings)[]).some(
    (key) => settings[key] !== saved[key],
  );

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function onSave() {
    setSaved(settings);
    toast.success("Settings saved");
  }

  function onDiscard() {
    setSettings(saved);
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Control / settings page
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Grouped preference sections with toggles, selects and radios. The save
          bar only appears once something changes.
        </p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellIcon size={18} />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ToggleRow
              id="email-notifications"
              title="Email notifications"
              description="Receive account and security emails."
              checked={settings.emailNotifications}
              onChange={(v) => update("emailNotifications", v)}
            />
            <Separator />
            <ToggleRow
              id="push-notifications"
              title="Push notifications"
              description="Send alerts to your registered devices."
              checked={settings.pushNotifications}
              onChange={(v) => update("pushNotifications", v)}
            />
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="digest"
                className="flex flex-col items-start gap-1"
              >
                <span className="text-sm font-medium">Activity digest</span>
                <span className="text-xs text-muted-foreground">
                  How often to bundle non-urgent updates.
                </span>
              </Label>
              <Select
                value={settings.digestFrequency}
                onValueChange={(value) =>
                  update(
                    "digestFrequency",
                    value as Settings["digestFrequency"],
                  )
                }
              >
                <SelectTrigger id="digest" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <EyeIcon size={18} />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium">
                Profile visibility
              </legend>
              {visibilityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="profile-visibility"
                    value={option.value}
                    checked={settings.profileVisibility === option.value}
                    onChange={() => update("profileVisibility", option.value)}
                    className="size-4 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            <Separator />
            <ToggleRow
              id="search-indexing"
              title="Search engine indexing"
              description="Allow your public profile to appear in search results."
              checked={settings.searchIndexing}
              onChange={(v) => update("searchIndexing", v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PaletteIcon size={18} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="theme"
                className="flex flex-col items-start gap-1"
              >
                <span className="text-sm font-medium">Theme</span>
                <span className="text-xs text-muted-foreground">
                  Match the system or pick a fixed mode.
                </span>
              </Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => {
                  const theme = value as Settings["theme"];
                  update("theme", theme);
                  setTheme(theme);
                }}
              >
                <SelectTrigger id="theme" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="density"
                className="flex flex-col items-start gap-1"
              >
                <span className="text-sm font-medium">Interface density</span>
                <span className="text-xs text-muted-foreground">
                  Compact fits more rows on screen.
                </span>
              </Label>
              <Select
                value={settings.density}
                onValueChange={(value) =>
                  update("density", value as Settings["density"])
                }
              >
                <SelectTrigger id="density" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-3">
            <p className="text-sm text-muted-foreground">
              You have unsaved changes.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onDiscard}>
                Discard
              </Button>
              <Button onClick={onSave}>Save changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="flex flex-col items-start gap-1">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value)}
      />
    </div>
  );
}
