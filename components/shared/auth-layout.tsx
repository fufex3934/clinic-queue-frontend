import Link from "next/link";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AuthLayout({
  title,
  description,
  children,
  backHref = "/",
  backLabel = "Back to home",
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen">
      <div className="hidden w-[42%] flex-col justify-between gradient-hero border-r border-subtle p-10 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-md">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Clinic Queue</p>
            <p className="text-sm text-muted-foreground">Healthcare operations</p>
          </div>
        </Link>
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Trusted queue &amp; appointment management
          </h2>
          <p className="text-muted-foreground">
            Built for reception desks and clinic admins — clear tokens, fast
            serve-next, and daily schedules in one place.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Large-format &quot;Now serving&quot; display
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Real-time queue updates
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              Role-based staff access
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          © Clinic Queue System
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gradient-brand p-4 sm:p-8">
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 lg:hidden"
          render={<Link href={backHref} />}
        >
          <ArrowLeft className="mr-2 size-4" />
          {backLabel}
        </Button>

        <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elevation-md">
            <Stethoscope className="size-6" />
          </div>
          <p className="text-lg font-semibold">Clinic Queue</p>
        </div>

        <Card className={cn("w-full max-w-md border-subtle shadow-elevation-lg")}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
