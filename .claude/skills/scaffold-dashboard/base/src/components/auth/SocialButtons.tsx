import { GithubLogoIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toastError } from "@/lib/toast";

type Provider = "github" | "google";

const PROVIDERS: {
  id: Provider;
  label: string;
  icon: typeof GithubLogoIcon;
}[] = [
  { id: "github", label: "Continue with GitHub", icon: GithubLogoIcon },
  { id: "google", label: "Continue with Google", icon: GoogleLogoIcon },
];

/**
 * Social sign-in buttons — a drop-in for the login/register pages that sits
 * alongside the email/password form. Each button calls
 * `authClient.signIn.social({ provider })`, which redirects to the provider's
 * OAuth consent screen and back to the app.
 *
 * Providers must be configured in `src/lib/auth.ts` (`socialProviders`) with the
 * matching client id/secret env vars. Until then the call fails fast and we
 * surface a friendly toast instead of a console error — so this renders safely in
 * a zero-config setup. See the `add-auth-method` skill.
 */
export function SocialButtons({
  callbackURL = "/",
}: {
  /** Where to land after a successful sign-in. */
  callbackURL?: string;
}) {
  const [pending, setPending] = useState<Provider | null>(null);

  async function signInWith(provider: Provider) {
    setPending(provider);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL,
      });
      if (error) {
        toastError(
          error.message ?? `${provider} sign-in isn't configured yet.`,
        );
      }
      // On success better-auth redirects to the provider, so we don't navigate.
    } catch {
      toastError(
        `${provider} sign-in isn't configured yet. Add its keys in src/lib/auth.ts.`,
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => signInWith(id)}
        >
          <Icon weight="fill" />
          {pending === id ? "Redirecting…" : label}
        </Button>
      ))}
    </div>
  );
}
