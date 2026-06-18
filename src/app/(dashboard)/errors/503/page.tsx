"use client";

import { WrenchIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ServiceUnavailablePage() {
  return (
    <Card className="w-full max-w-md p-4">
      <CardContent className="flex flex-col items-center space-y-6 py-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-none bg-amber-500/10">
          <WrenchIcon className="w-10 h-10 text-amber-600" weight="fill" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-foreground">503</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Service Unavailable
          </h2>
          <p className="text-muted-foreground">
            The service is temporarily unavailable due to maintenance. Please
            check back shortly.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button onClick={() => window.location.reload()} className="flex-1">
            Refresh Page
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Go Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
