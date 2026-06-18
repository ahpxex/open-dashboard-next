"use client";

import { WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 py-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-none bg-destructive/10">
            <WarningCircleIcon
              className="w-10 h-10 text-destructive"
              weight="fill"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold text-foreground">500</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Something Went Wrong
            </h2>
            <p className="text-muted-foreground">
              An unexpected error occurred. Please try again or contact support
              if the problem persists.
            </p>
            {error.digest && (
              <p className="text-sm text-muted-foreground font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-3 w-full">
            <Button onClick={reset} variant="destructive" className="flex-1">
              Try Again
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/";
              }}
              variant="outline"
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
