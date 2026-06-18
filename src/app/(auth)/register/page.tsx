"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/dist/ssr";
import { useRegister } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { TextLink } from "@/components/ui/text-link";
import { registerSchema } from "@/lib/schemas";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { mutateAsync: register, isPending: isLoading } = useRegister();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const resetFieldErrors = (...keys: (keyof RegisterErrors)[]) => {
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

  const passwordHints = useMemo(() => {
    const requirements: string[] = [];
    if (password.length < 8) {
      requirements.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      requirements.push("Must include at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      requirements.push("Must include at least 1 lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      requirements.push("Must include at least 1 number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      requirements.push("Must include at least 1 special character");
    }
    return requirements;
  }, [password]);

  const passwordStrength = password.length > 0 ? 5 - passwordHints.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    const result = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: RegisterErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterErrors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!agreeToTerms) {
      setErrors({
        general: "You must agree to the Terms of Service and Privacy Policy",
      });
      return;
    }

    try {
      const response = await register({
        email,
        password,
        name,
        redirectTo: "/login",
      });

      if (response?.success === false) {
        setErrors({
          general:
            response.error?.message ||
            "Failed to create account. Please try again.",
        });
        return;
      }

      setSuccessMessage(
        `We just sent a verification link to ${email}. Please verify your email before signing in.`,
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreeToTerms(false);
    } catch (error: any) {
      setErrors({
        general: error.message || "Failed to create account. Please try again.",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-2 justify-center items-center">
        <h1 className="text-4xl font-bold">Create Account</h1>
        <div className="flex space-x-1">
          <p className="text-muted-foreground">Already have an account?</p>
          <TextLink href="/login">Sign in here</TextLink>
          <p>.</p>
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertTitle>Unable to create account</AlertTitle>
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="border-green-500/40 text-green-700 dark:text-green-400">
                <AlertTitle>Account created!</AlertTitle>
                <AlertDescription>
                  {successMessage}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-fit"
                    onClick={() => router.push("/login")}
                  >
                    Go to login
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <Field label="Full Name" required error={errors.name}>
              <Input
                required
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  resetFieldErrors("name");
                }}
                aria-invalid={!!errors.name}
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <Input
                required
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  resetFieldErrors("email");
                }}
                aria-invalid={!!errors.email}
              />
            </Field>
            <Field
              label="Password"
              required
              error={errors.password}
              description={
                password.length > 0 ? (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-none ${
                            index < passwordStrength
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength === 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength:{" "}
                      {passwordStrength <= 2
                        ? "Weak"
                        : passwordStrength === 3
                          ? "Medium"
                          : "Strong"}
                    </p>
                    {passwordHints.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-muted-foreground mt-1">
                        {passwordHints.map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : undefined
              }
            >
              <div className="relative">
                <Input
                  required
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    resetFieldErrors("password");
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
            <Field
              label="Confirm Password"
              required
              error={
                confirmPassword.length > 0 && password !== confirmPassword
                  ? "Passwords do not match"
                  : errors.confirmPassword
              }
            >
              <div className="relative">
                <Input
                  required
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    resetFieldErrors("confirmPassword");
                  }}
                  aria-invalid={
                    confirmPassword.length > 0 && password !== confirmPassword
                  }
                  className="pr-9"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label={
                    isConfirmPasswordVisible
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                >
                  {isConfirmPasswordVisible ? (
                    <EyeSlash className="h-5 w-5" weight="bold" />
                  ) : (
                    <Eye className="h-5 w-5" weight="bold" />
                  )}
                </Button>
              </div>
            </Field>
            <label className="flex items-start gap-2 text-xs mb-2">
              <Checkbox
                className="mt-0.5"
                checked={agreeToTerms}
                onCheckedChange={(value) => {
                  setAgreeToTerms(value === true);
                  resetFieldErrors("general");
                }}
              />
              <span>
                I agree to the <TextLink href="#">Terms of Service</TextLink>{" "}
                and <TextLink href="#">Privacy Policy</TextLink>
              </span>
            </label>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Spinner /> : null}
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
