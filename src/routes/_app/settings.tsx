import { SignOutIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name ?? "");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    const { error } = await authClient.updateUser({ name });
    setPending(false);
    if (error) {
      setStatus({
        type: "error",
        message: error.message ?? "Unable to update your profile.",
      });
      return;
    }
    setStatus({
      type: "success",
      message: "Your display name has been updated.",
    });
  }

  async function onSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account profile and active session.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account settings</CardTitle>
          <CardDescription>
            Update how your name appears across the dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="flex flex-col gap-4">
            {status ? (
              <Alert
                variant={status.type === "error" ? "destructive" : "default"}
              >
                <AlertTitle>
                  {status.type === "error"
                    ? "Update failed"
                    : "Profile updated"}
                </AlertTitle>
                <AlertDescription>{status.message}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed here.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>You are signed in as {user.email}.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            type="button"
            variant="destructive"
            onClick={onSignOut}
            disabled={signingOut}
          >
            <SignOutIcon />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
