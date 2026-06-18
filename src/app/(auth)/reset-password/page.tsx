"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("One special character");
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordErrors.length > 0 || password !== confirmPassword) return;

    setIsLoading(true);
    setTimeout(() => {
      console.log("Password reset completed");
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <>
        <div className="flex flex-col space-y-2 justify-center items-center">
          <h1 className="text-4xl font-bold">Password Reset Success</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">
              Password successfully reset
            </h3>
            <p className="text-muted-foreground mb-4">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
            <Button onClick={() => router.push("/login")}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 justify-center items-center">
        <h1 className="text-4xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground">
          Please enter your new password below.
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="New Password"
              required
              error={
                password.length > 0 && passwordErrors.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {passwordErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                ) : undefined
              }
            >
              <Input
                required
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field
              label="Confirm New Password"
              required
              error={
                confirmPassword.length > 0 && password !== confirmPassword
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
              />
            </Field>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                passwordErrors.length > 0
              }
              className="w-full"
            >
              {isLoading ? <Spinner /> : null}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
