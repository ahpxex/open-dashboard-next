import {
  ArrowLeftIcon,
  CloudSlashIcon,
  FileXIcon,
  type Icon,
  LockIcon,
  ProhibitIcon,
  WarningIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/errors/$code")({
  component: ErrorShowcase,
});

type ErrorDetail = {
  title: string;
  description: string;
  icon: Icon;
};

const ERRORS: Record<string, ErrorDetail> = {
  "401": {
    title: "Unauthorized",
    description:
      "You need to be signed in to access this resource. Please log in and try again.",
    icon: LockIcon,
  },
  "403": {
    title: "Forbidden",
    description:
      "You don't have permission to view this page. Contact an administrator if you believe this is a mistake.",
    icon: ProhibitIcon,
  },
  "404": {
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or may have been moved.",
    icon: FileXIcon,
  },
  "500": {
    title: "Internal server error",
    description:
      "Something went wrong on our end. Please try again in a few moments.",
    icon: WarningOctagonIcon,
  },
  "503": {
    title: "Service unavailable",
    description:
      "The service is temporarily unavailable, likely due to maintenance. Please check back soon.",
    icon: CloudSlashIcon,
  },
};

const FALLBACK: ErrorDetail = {
  title: "Something went wrong",
  description:
    "An unexpected error occurred. Try heading back to the dashboard.",
  icon: WarningIcon,
};

function ErrorShowcase() {
  const { code } = Route.useParams();
  const detail = ERRORS[code] ?? FALLBACK;
  const ErrorIcon = detail.icon;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <ErrorIcon size={56} className="text-muted-foreground" weight="duotone" />
      <p className="font-heading text-6xl font-semibold tracking-tight">
        {code}
      </p>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-xl font-semibold">{detail.title}</h1>
        <p className="text-sm text-muted-foreground">{detail.description}</p>
      </div>
      <Button render={<Link to="/" />}>
        <ArrowLeftIcon />
        Back to dashboard
      </Button>
    </div>
  );
}
