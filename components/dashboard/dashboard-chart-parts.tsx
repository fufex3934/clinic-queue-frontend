"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ResponsiveContainer } from "recharts";

/** Fixed plot height so Recharts never measures a 0×0 parent. */
export const CHART_PLOT_HEIGHT = 240;

export function ChartPlot({ children }: { children: React.ReactElement }) {
  return (
    <ResponsiveContainer width="100%" height={CHART_PLOT_HEIGHT} minWidth={0}>
      {children}
    </ResponsiveContainer>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
  trend,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  trend?: string;
}) {
  return (
    <Card
      className={cn(
        "shadow-elevation-sm transition-shadow duration-200 hover:shadow-elevation-md",
        accent && "border-primary/25 bg-primary/5",
      )}
    >
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tabular-nums tracking-tight">
            {value}
          </p>
          {trend && (
            <p className="flex items-center gap-1 text-xs font-medium text-primary">
              <TrendingUp className="size-3" aria-hidden />
              {trend}
            </p>
          )}
          {hint && !trend && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl shadow-elevation-sm",
            accent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className={cn("shadow-elevation-sm", className)}>
      <CardHeader className="border-b border-subtle pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[280px] min-h-[280px] w-full min-w-0 pt-6">
        {mounted ? (
          <div className="h-full min-h-[240px] w-full min-w-0">{children}</div>
        ) : (
          <Skeleton className="h-full min-h-[240px] w-full rounded-lg" />
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-subtle bg-muted/20 px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[360px] rounded-xl" />
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
    </div>
  );
}
