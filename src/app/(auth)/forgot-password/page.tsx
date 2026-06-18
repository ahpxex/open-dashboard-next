"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TextLink } from "@/components/ui/text-link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      console.log("Password reset requested for:", email);
      setIsLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <>
        <div className="flex flex-col space-y-2 justify-center items-center">
          <h1 className="text-4xl font-bold">Check your email</h1>
        </div>
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-5xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Email sent</h3>
            <p className="text-muted-foreground mb-4">
              If an account exists for {email}, you will receive a password
              reset link shortly.
            </p>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Back to form
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-2 justify-center items-center">
        <h1 className="text-4xl font-bold">Forgot Password</h1>
        <div className="flex space-x-1">
          <p className="text-muted-foreground">Remember your password?</p>
          <TextLink href={"/login"}>Sign in here</TextLink>
          <p>.</p>
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your email address and we will send you a link to reset your
              password.
            </p>
            <Field label="Email" required>
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Spinner /> : null}
              Send Reset Link
            </Button>
            <div className="text-center">
              <TextLink href="/login">Back to Sign In</TextLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
