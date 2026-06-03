import {
  Activity,
  BellRing,
  CalendarDays,
  ClipboardPlus,
  FileBarChart2,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const featureItems = [
  {
    icon: Activity,
    title: "Queue management",
    description: "Large serving display, drag reorder, and real-time updates.",
  },
  {
    icon: CalendarDays,
    title: "Appointment booking",
    description: "Slot capacity, daily views, and status workflow.",
  },
  {
    icon: ClipboardPlus,
    title: "Patient records",
    description: "Register, search, and link patients to queue & visits.",
  },
  {
    icon: FileBarChart2,
    title: "Analytics",
    description: "7-day trends, peak hours, and clinic KPIs.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Reception, admin, and platform admin permissions.",
  },
  {
    icon: BellRing,
    title: "Live notifications",
    description: "Payments, renewals, and operational alerts.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-y border-subtle bg-surface py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Built for daily clinic operations
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything reception and admin teams need — without clutter.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-subtle shadow-elevation-sm transition-shadow duration-200 hover:shadow-elevation-md"
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-3 text-base">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span>{title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
