import { ClipboardList, LayoutDashboard, RefreshCcw, TimerReset } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const solutions = [
  {
    icon: ClipboardList,
    title: "Digital queue system",
    description: "Track tokens, waiting patients, and serving status in real time.",
  },
  {
    icon: TimerReset,
    title: "Appointment scheduling",
    description: "Book by date and slot to reduce crowding and missed visits.",
  },
  {
    icon: RefreshCcw,
    title: "Real-time updates",
    description: "Keep front desk and staff aligned with instant queue changes.",
  },
  {
    icon: LayoutDashboard,
    title: "Easy receptionist dashboard",
    description: "Simple actions and clean screens for fast daily operations.",
  },
];

export function Solution() {
  return (
    <section>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Our Solution
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {solutions.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-border/70 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </span>
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Built to improve service quality while reducing workload.
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
