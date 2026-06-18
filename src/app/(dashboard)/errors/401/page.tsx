"use client";

import { LockKeyIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <Card className="w-full max-w-md p-4">
      <CardContent className="flex flex-col items-center space-y-6 py-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-none bg-amber-500/10">
          <LockKeyIcon className="w-10 h-10 text-amber-600" weight="fill" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-foreground">401</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Unauthorized
          </h2>
          <p className="text-muted-foreground">
            You need to sign in to access this resource. Please authenticate to
            continue.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            className="flex-1"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign In
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
