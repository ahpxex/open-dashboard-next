"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundDemoPage() {
  return (
    <Card className="w-full max-w-md p-4">
      <CardContent className="flex flex-col items-center space-y-6 py-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-none bg-primary/10">
          <MagnifyingGlassIcon
            className="w-10 h-10 text-primary"
            weight="bold"
          />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            className="flex-1"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Go Home
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex-1"
          >
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
