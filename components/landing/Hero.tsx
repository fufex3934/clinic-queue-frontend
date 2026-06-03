import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  ListOrdered,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="gradient-hero border-b border-subtle">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
        <div className="flex flex-col justify-center space-y-6">
          <Badge variant="secondary" className="w-fit text-xs font-semibold">
            Built for Ethiopian clinics
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl md:leading-[1.1]">
            Queue &amp; appointments your front desk can trust
          </h1>
          <p className="max-w-xl text-base text-muted-foreground md:text-lg">
            Reduce waiting time with a large-format serving display, drag-to-reorder
            waiting lines, and slot-based scheduling — all in one SaaS dashboard.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="shadow-elevation-sm" render={<Link href="#contact" />}>
              Start free trial
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/login" />}>
              Staff login
            </Button>
          </div>
        </div>

        <div className="surface-elevated overflow-hidden rounded-2xl p-6 shadow-elevation-lg transition-transform duration-300 hover:-translate-y-0.5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live dashboard preview
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/25 bg-primary/10 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Now serving
              </p>
              <p className="mt-2 text-5xl font-bold tabular-nums text-primary">#12</p>
              <p className="mt-1 text-sm font-medium">Abebe Kebede</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ListOrdered, label: "8 waiting", tone: "status-waiting" },
                { icon: CalendarCheck2, label: "14 today", tone: "status-completed" },
                { icon: Users, label: "240 patients", tone: "bg-accent text-accent-foreground" },
              ].map(({ icon: Icon, label, tone }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-center text-xs font-semibold ${tone}`}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
