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
  { icon: Activity, title: "Queue Management" },
  { icon: CalendarDays, title: "Appointment Booking" },
  { icon: ClipboardPlus, title: "Patient Records" },
  { icon: FileBarChart2, title: "Reports & Analytics" },
  { icon: ShieldCheck, title: "Multi-user roles" },
  { icon: BellRing, title: "Real-time updates" },
];

export function Features() {
  return (
    <section id="features" className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Powerful Features for Daily Clinic Operations
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureItems.map(({ icon: Icon, title }) => (
            <Card key={title} className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" />
                  </span>
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Simple and reliable workflow designed for busy clinics.
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
