import { AlertCircle, CalendarX2, FileWarning, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const painPoints = [
  { icon: UsersRound, text: "Long patient queues" },
  { icon: CalendarX2, text: "Lost or missed appointments" },
  { icon: FileWarning, text: "Paper-based systems" },
  { icon: AlertCircle, text: "Patient frustration" },
];

export function Problem() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Challenges Clinics Face Today
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {painPoints.map(({ icon: Icon, text }) => (
            <Card key={text} className="border-border/70 shadow-sm">
              <CardHeader className="pb-1">
                <CardTitle className="flex items-center gap-3 text-base">
                  <span className="rounded-lg bg-destructive/10 p-2 text-destructive">
                    <Icon className="size-4" />
                  </span>
                  {text}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                This issue affects patient flow and clinic efficiency every day.
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
