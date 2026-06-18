"use client";

import { useGetIdentity } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SessionUser } from "@/lib/auth/session";

export default function SettingsPage() {
  const { data: user } = useGetIdentity<SessionUser>();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Profile Settings</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Name">
              <Input
                key={user?.name ?? "name"}
                placeholder="Enter your name"
                defaultValue={user?.name || ""}
              />
            </Field>
            <Field label="Email">
              <Input
                key={user?.email ?? "email"}
                type="email"
                placeholder="Enter your email"
                defaultValue={user?.email || ""}
              />
            </Field>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Notifications</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Security</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Current Password">
              <Input type="password" placeholder="Enter current password" />
            </Field>
            <Field label="New Password">
              <Input type="password" placeholder="Enter new password" />
            </Field>
            <Field label="Confirm New Password">
              <Input type="password" placeholder="Confirm new password" />
            </Field>
            <Button>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
