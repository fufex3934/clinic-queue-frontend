import Link from "next/link";
import { ArrowRight, CalendarCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
      <div className="space-y-6">
        <Badge variant="secondary" className="text-xs">
          Built for Ethiopian clinics
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          Manage Your Clinic Queue &amp; Appointments Easily
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Reduce waiting time, organize patients, and improve service — all in
          one system.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="#contact" />}>
            Start Free Trial
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="#contact" />}>
            Book Demo
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm transition-transform duration-300 hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="flex h-72 items-center justify-center bg-gradient-to-br from-primary/15 to-teal-500/10 md:h-full">
            <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
              <CalendarCheck2 className="size-5 text-primary" />
              <span className="text-sm font-medium">Dashboard Mock Preview</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
