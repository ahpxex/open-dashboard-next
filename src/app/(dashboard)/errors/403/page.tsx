"use client";

import { ProhibitIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <Card className="w-full max-w-md p-4">
      <CardContent className="flex flex-col items-center space-y-6 py-8">
        <div className="flex items-center justify-center w-20 h-20 rounded-none bg-destructive/10">
          <ProhibitIcon className="w-10 h-10 text-destructive" weight="fill" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-foreground">403</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Access Forbidden
          </h2>
          <p className="text-muted-foreground">
            You do not have permission to access this resource. Contact your
            administrator if you believe this is an error.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="destructive"
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
