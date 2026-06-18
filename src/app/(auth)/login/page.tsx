"use client";

import {
  Eye,
  EyeSlash,
  GithubLogoIcon,
  GoogleLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useLogin } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TextLink } from "@/components/ui/text-link";
import { loginSchema } from "@/lib/schemas";

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { mutateAsync: login, isPending: isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const resetErrors = (...keys: (keyof LoginErrors)[]) => {
    setErrors((prev) => {
      if (!prev.general && keys.every((key) => !prev[key])) {
        return prev;
      }
      const next = { ...prev };
      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
        }
      });
      delete next.general;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const response = await login({
        email,
        password,
        remember: rememberMe,
      });

      if (response?.success === false) {
        setErrors({
          general:
            response.error?.message ||
            "Failed to sign in. Please check your credentials.",
        });
        return;
      }

      const redirectTo = response?.redirectTo ?? "/";
      router.push(redirectTo);
    } catch (error: any) {
      setErrors({
        general:
          error?.message || "Failed to sign in. Please check your credentials.",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 justify-center items-center">
        <h1 className="text-4xl font-bold">Welcome Back</h1>
        <div className="flex space-x-1">
          <p className="text-muted-foreground">Sign in to your account, or</p>
          <TextLink href={"/register"}>sign up here</TextLink>
          <p>.</p>
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertTitle>Unable to sign in</AlertTitle>
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            <Field label="Email" required error={errors.email}>
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  resetErrors("email");
                }}
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <Input
                  required
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    resetErrors("password");
                  }}
                  aria-invalid={!!errors.password}
                  className="pr-9"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                >
                  {isPasswordVisible ? (
                    <EyeSlash className="h-5 w-5" weight="bold" />
                  ) : (
                    <Eye className="h-5 w-5" weight="bold" />
                  )}
                </Button>
              </div>
            </Field>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(value) => setRememberMe(value === true)}
                />
                <span>Remember me</span>
              </label>
              <TextLink href="/forgot-password">Forgot password?</TextLink>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Spinner /> : null}
              Sign In
            </Button>
          </form>
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <GoogleLogoIcon />
              Google
            </Button>
            <Button variant="outline">
              <GithubLogoIcon />
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
