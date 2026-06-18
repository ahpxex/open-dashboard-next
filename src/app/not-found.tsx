import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center space-y-6 py-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-none bg-primary/10">
            <MagnifyingGlassIcon className="w-10 h-10 text-primary" />
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
              variant="outline"
              className="flex-1"
              nativeButton={false}
              render={<Link href="/errors/404" />}
            >
              View Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
