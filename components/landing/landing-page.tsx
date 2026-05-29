import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ListOrdered,
  Shield,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: ListOrdered,
    title: "Queue management",
    description:
      "Daily tokens, waiting lists, and one-click serve-next for walk-in patients.",
  },
  {
    icon: CalendarDays,
    title: "Appointments",
    description:
      "Book by date and time slot with capacity limits so schedules stay manageable.",
  },
  {
    icon: Shield,
    title: "Built for staff",
    description:
      "Clear status, confirmations, and a dashboard designed for busy reception desks.",
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-teal-50/30 to-background dark:from-slate-950 dark:via-teal-950/15 dark:to-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="size-5" />
            </div>
            <span className="font-semibold tracking-tight">Clinic Queue</span>
          </Link>
          <Button variant="outline" render={<Link href="/login" />}>
            Staff login
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Clinic operations · Queue & appointments
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl md:leading-tight">
              Run your clinic queue and schedule in one place
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Manage walk-in tokens, serve patients in order, and view daily
              appointments — built for reception teams and admin staff.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/login" />}>
                Get started
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/login" />}
              >
                Staff login
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t bg-background/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Everything you need at the front desk
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              Simple tools that match how clinics actually work — no clutter.
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-border/80 shadow-sm">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="rounded-2xl border bg-primary px-6 py-12 text-center text-primary-foreground md:px-12">
            <h2 className="text-2xl font-semibold">Ready to open the dashboard?</h2>
            <p className="mx-auto mt-2 max-w-md text-primary-foreground/85">
              Sign in with your staff account to manage today&apos;s queue and
              appointment schedule.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              render={<Link href="/login" />}
            >
              Go to login
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Clinic Queue System · MVP</p>
      </footer>
    </div>
  );
}
