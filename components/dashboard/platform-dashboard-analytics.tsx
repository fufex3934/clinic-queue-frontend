"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Users,
  UserCog,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "@/components/shared/error-alert";
import {
  AnalyticsSkeleton,
  ChartCard,
  ChartPlot,
  EmptyChart,
  KpiCard,
} from "@/components/dashboard/dashboard-chart-parts";
import {
  chartAxisTick,
  chartGridStroke,
  chartTooltipStyle,
  CHART_COLORS,
  SERIES_PALETTE,
} from "@/lib/chart-theme";
import { getErrorMessage } from "@/lib/errors";
import { statsService } from "@/services/statsService";
import {
  isPlatformDashboardStats,
  type PlatformDashboardStats,
} from "@/types/stats";

export function PlatformDashboardAnalytics() {
  const [stats, setStats] = useState<PlatformDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await statsService.getDashboard();
      if (!isPlatformDashboardStats(data)) {
        setError("Expected platform-wide statistics");
        return;
      }
      setStats(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load platform statistics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const queuePieData = useMemo(
    () =>
      stats?.queueStatusToday
        .filter((s) => s.count > 0)
        .map((s) => ({ name: s.label, value: s.count })) ?? [],
    [stats],
  );

  const appointmentPieData = useMemo(
    () =>
      stats?.appointmentStatusToday.map((s) => ({
        name: s.label,
        value: s.count,
      })) ?? [],
    [stats],
  );

  const clinicBarData = useMemo(
    () =>
      stats?.clinicsOverview.map((c) => ({
        name: c.name.length > 14 ? `${c.name.slice(0, 12)}…` : c.name,
        fullName: c.name,
        waiting: c.queueWaiting,
        appointments: c.appointmentsToday,
        patients: c.patientsTotal,
      })) ?? [],
    [stats],
  );

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !stats) {
    return (
      <ErrorAlert
        title="Platform statistics unavailable"
        message={error ?? "No data"}
        onRetry={load}
      />
    );
  }

  const { kpis, today } = stats;
  const hasQueueTrend = stats.queueLast7Days.some((d) => d.total > 0);
  const hasApptTrend = stats.appointmentsLast7Days.some((d) => d.total > 0);
  const hasClinics = stats.clinicsOverview.length > 0;
  const hasClinicGrowth = stats.clinicsGrowth.some((d) => d.total > 0);
  const patientsPerClinic = clinicBarData.map((c) => ({
    name: c.name,
    fullName: c.fullName,
    patients: c.patients,
  }));
  const appointmentsPerClinic = clinicBarData.map((c) => ({
    name: c.name,
    fullName: c.fullName,
    appointments: c.appointments,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Platform overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Aggregated across {kpis.clinicsTotal} clinic
            {kpis.clinicsTotal === 1 ? "" : "s"} · {today} (UTC) · updated{" "}
            {new Date(stats.generatedAt).toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/dashboard/admin" />}>
          Manage clinics
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          label="Active clinics"
          value={kpis.clinicsTotal}
          hint="Registered tenants"
          icon={Building2}
        />
        <KpiCard
          label="Total patients"
          value={kpis.patientsTotal}
          hint="Across all clinics"
          icon={Users}
        />
        <KpiCard
          label="Total staff"
          value={kpis.staffTotal}
          hint="Clinic admin & reception accounts"
          icon={UserCog}
        />
        <KpiCard
          label="Waiting (all clinics)"
          value={kpis.queueWaiting}
          hint={
            kpis.queueServing > 0
              ? `${kpis.queueServing} being served platform-wide`
              : "Walk-in queues today"
          }
          icon={Clock}
          accent={kpis.queueWaiting > 0}
        />
        <KpiCard
          label="Appointments today"
          value={kpis.appointmentsToday}
          hint={`${kpis.appointmentsArrivedToday} arrived · ${kpis.queueCompletedToday} queue completed`}
          icon={CalendarCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Queue activity (7 days)"
          description="All clinics — tokens issued vs completed"
        >
          {hasQueueTrend ? (
            <ChartPlot>
              <AreaChart data={stats.queueLast7Days}>
                <defs>
                  <linearGradient id="platformQueueTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="platformQueueDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERIES_PALETTE[2]} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={SERIES_PALETTE[2]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="total" name="Total" stroke={CHART_COLORS.primary} fill="url(#platformQueueTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke={SERIES_PALETTE[2]} fill="url(#platformQueueDone)" strokeWidth={2} />
              </AreaChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No queue activity across clinics" />
          )}
        </ChartCard>

        <ChartCard
          title="Appointments (7 days)"
          description="All clinics — bookings, arrivals, cancellations"
        >
          {hasApptTrend ? (
            <ChartPlot>
              <BarChart data={stats.appointmentsLast7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Booked" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                <Bar dataKey="arrived" name="Arrived" fill={SERIES_PALETTE[2]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill={SERIES_PALETTE[4]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No appointments across clinics" />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Clinics growth (7 days)"
        description="New clinics registered per day"
        className="lg:col-span-2"
      >
        {hasClinicGrowth ? (
          <ChartPlot>
            <AreaChart data={stats.clinicsGrowth}>
              <defs>
                <linearGradient id="clinicGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
              <Area type="monotone" dataKey="total" name="New clinics" stroke={CHART_COLORS.primary} fill="url(#clinicGrowthFill)" strokeWidth={2} />
            </AreaChart>
          </ChartPlot>
        ) : (
          <EmptyChart message="No new clinics in the last 7 days" />
        )}
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Patients per clinic" description="Total registered patients">
          {hasClinics ? (
            <ChartPlot>
              <BarChart data={patientsPerClinic}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="name" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ""} />
                <Bar dataKey="patients" name="Patients" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No clinics yet" />
          )}
        </ChartCard>

        <ChartCard title="Appointments per clinic" description="Bookings today by tenant">
          {hasClinics ? (
            <ChartPlot>
              <BarChart data={appointmentsPerClinic}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="name" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} labelFormatter={(_, p) => p?.[0]?.payload?.fullName ?? ""} />
                <Bar dataKey="appointments" name="Appointments" fill={SERIES_PALETTE[2]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No appointments today" />
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Queue activity by clinic"
        description="Waiting patients and appointments per tenant today"
        className="lg:col-span-2"
      >
        {hasClinics ? (
          <ChartPlot>
            <BarChart data={clinicBarData} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis dataKey="name" tick={chartAxisTick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={chartTooltipStyle.contentStyle}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullName ?? ""
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="waiting" name="Queue waiting" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="appointments" name="Appointments" fill={SERIES_PALETTE[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartPlot>
        ) : (
          <EmptyChart message="No clinics registered yet" />
        )}
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Queue status today" description="Platform-wide walk-in tokens">
          {queuePieData.length > 0 ? (
            <ChartPlot>
              <PieChart>
                <Pie data={queuePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={3}>
                  {queuePieData.map((_, i) => (
                    <Cell key={i} fill={SERIES_PALETTE[i % SERIES_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No queue entries today" />
          )}
        </ChartCard>

        <ChartCard title="Appointment status today" description="Platform-wide booking states">
          {appointmentPieData.length > 0 ? (
            <ChartPlot>
              <PieChart>
                <Pie data={appointmentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={56} outerRadius={88} paddingAngle={2}>
                  {appointmentPieData.map((_, i) => (
                    <Cell key={i} fill={SERIES_PALETTE[i % SERIES_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ChartPlot>
          ) : (
            <EmptyChart message="No appointments today" />
          )}
        </ChartCard>
      </div>

      {hasClinics && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <UserCog className="size-4 text-primary" />
              <h3 className="font-medium">Clinic breakdown</h3>
            </div>
            <Table className="table-zebra">
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead className="text-right">Patients</TableHead>
                  <TableHead className="text-right">Waiting</TableHead>
                  <TableHead className="text-right">Queue today</TableHead>
                  <TableHead className="text-right">Appts today</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.clinicsOverview.map((row) => (
                  <TableRow key={row.clinicId}>
                    <TableCell className="font-medium">
                      {row.name}
                      {row.isActive === false && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (inactive)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{row.patientsTotal}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.queueWaiting}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.queueTotalToday}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.appointmentsToday}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-wrap items-center gap-3 py-4 text-sm text-muted-foreground">
          <Activity className="size-4 shrink-0 text-primary" />
          <span>
            Platform view aggregates all clinics. Clinic admins only see their
            own tenant on this page.
          </span>
          <CheckCircle2 className="size-3.5" />
          <span>Run <code className="text-xs">pnpm run seed:demo</code> to populate sample tenants.</span>
        </CardContent>
      </Card>
    </div>
  );
}
