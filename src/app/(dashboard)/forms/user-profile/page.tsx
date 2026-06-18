"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function UserProfileFormsPage() {
  return (
    <div className="w-full p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">User & Profile Management</h1>
        <p className="text-gray-600">
          Forms for managing user profiles, personal information, password
          changes, and notification preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
          <TabsTrigger value="notifications">Notification Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <UserProfileForm />
        </TabsContent>
        <TabsContent value="password">
          <ChangePasswordForm />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserProfileForm() {
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [bio, setBio] = useState(
    "Software developer with a passion for building great products.",
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    setTimeout(() => {
      console.log("Profile updated:", {
        firstName,
        lastName,
        email,
        phone,
        bio,
        profileImage,
      });
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-none bg-gray-200">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl text-gray-500">
                    {firstName[0]}
                    {lastName[0]}
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-image"
              />
              <label htmlFor="profile-image">
                <Button
                  render={<span />}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                >
                  Change Photo
                </Button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <Input
                required
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Field>
            <Field label="Last Name" required>
              <Input
                required
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Field>
          </div>

          <Field
            label="Email"
            required
            description="Email cannot be changed. Contact support if you need to update it."
          >
            <Input
              required
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
            />
          </Field>

          <Field label="Phone Number">
            <Input
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field label="Bio" description={`${bio.length}/500 characters`}>
            <Textarea
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </Field>

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("One special character");
    return errors;
  };

  const passwordErrors = newPassword ? validatePassword(newPassword) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (!currentPassword) {
      setError("Current password is required");
      setIsLoading(false);
      return;
    }

    if (passwordErrors.length > 0) {
      setError("New password does not meet requirements");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      console.log("Password changed successfully");
      setIsLoading(false);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <Card className="max-w-md mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Change Password</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            For security, you must enter your current password to change it.
          </p>

          <Field label="Current Password" required>
            <Input
              required
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>

          <Field
            label="New Password"
            required
            error={
              newPassword.length > 0 && passwordErrors.length > 0 ? (
                <ul className="list-disc list-inside">
                  {passwordErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              ) : undefined
            }
          >
            <Input
              required
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={newPassword.length > 0 && passwordErrors.length > 0}
            />
          </Field>

          <Field
            label="Confirm New Password"
            required
            error={
              confirmPassword.length > 0 && newPassword !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          >
            <Input
              required
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={
                confirmPassword.length > 0 && newPassword !== confirmPassword
              }
            />
          </Field>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-none text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Password changed successfully!
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Spinner /> : null}
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function NotificationSettingsForm() {
  const [emailComments, setEmailComments] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [emailNewsletter, setEmailNewsletter] = useState(false);
  const [pushSystemAlerts, setPushSystemAlerts] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);
  const [pushActivity, setPushActivity] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    setTimeout(() => {
      console.log("Notification settings updated:", {
        email: { emailComments, emailUpdates, emailNewsletter },
        push: { pushSystemAlerts, pushMessages, pushActivity },
        sms: { smsAlerts },
      });
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  return (
    <Card className="max-w-2xl mt-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Email Notifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Comments</p>
                    <p className="text-sm text-gray-600">
                      Get notified when someone comments on your posts
                    </p>
                  </div>
                  <Switch
                    checked={emailComments}
                    onCheckedChange={setEmailComments}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Product Updates</p>
                    <p className="text-sm text-gray-600">
                      Receive updates about new features and improvements
                    </p>
                  </div>
                  <Switch
                    checked={emailUpdates}
                    onCheckedChange={setEmailUpdates}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Newsletter</p>
                    <p className="text-sm text-gray-600">
                      Subscribe to our weekly newsletter
                    </p>
                  </div>
                  <Switch
                    checked={emailNewsletter}
                    onCheckedChange={setEmailNewsletter}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Push Notifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">System Alerts</p>
                    <p className="text-sm text-gray-600">
                      Important system notifications and alerts
                    </p>
                  </div>
                  <Switch
                    checked={pushSystemAlerts}
                    onCheckedChange={setPushSystemAlerts}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-gray-600">
                      Get notified when you receive a new message
                    </p>
                  </div>
                  <Switch
                    checked={pushMessages}
                    onCheckedChange={setPushMessages}
                  />
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Activity</p>
                    <p className="text-sm text-gray-600">
                      Updates about activity on your account
                    </p>
                  </div>
                  <Switch
                    checked={pushActivity}
                    onCheckedChange={setPushActivity}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">SMS Notifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-none">
                  <div>
                    <p className="font-medium">Critical Alerts</p>
                    <p className="text-sm text-gray-600">
                      Receive text messages for critical alerts only
                    </p>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                </div>
              </div>
            </div>
          </div>

          {isSaved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-none text-green-700 text-sm">
              Notification settings saved successfully!
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button">
              Reset to Defaults
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : null}
              Save Preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
