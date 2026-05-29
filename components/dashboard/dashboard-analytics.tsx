"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListOrdered,
  Users,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  AnalyticsSkeleton,
  ChartCard,
  EmptyChart,
  KpiCard,
} from "@/components/dashboard/dashboard-chart-parts";
import { ErrorAlert } from "@/components/shared/error-alert";
import { useAuth } from "@/contexts/auth-provider";
import {
  chartAxisTick,
  chartGridStroke,
  chartTooltipStyle,
  CHART_COLORS,
  SERIES_PALETTE,
} from "@/lib/chart-theme";
import { canAccessFeature } from "@/lib/permissions";
import { getErrorMessage } from "@/lib/errors";
import { statsService } from "@/services/statsService";
import {
  isClinicDashboardStats,
  type ClinicDashboardStats,
} from "@/types/stats";

export function DashboardAnalytics() {
  const { user } = useAuth();
  const role = user?.role;
  const [stats, setStats] = useState<ClinicDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const showPatients = canAccessFeature(role, "patients");
  const showQueue = canAccessFeature(role, "queue");
  const showAppointments = canAccessFeature(role, "appointments");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await statsService.getDashboard();
      if (!isClinicDashboardStats(data)) {
        setError("Expected clinic-scoped statistics");
        return;
      }
      setStats(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load dashboard statistics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const queuePieData = useMemo(
    () =>
      stats?.queueStatusToday.filter((s) => s.count > 0).map((s) => ({
        name: s.label,
        value: s.count,
      })) ?? [],
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

  const slotChartData = useMemo(
    () =>
      stats?.appointmentsBySlotToday.map((s) => ({
        slot: s.slot,
        booked: s.count,
        remaining: Math.max(0, s.capacity - s.count),
      })) ?? [],
    [stats],
  );

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error || !stats) {
    return (
      <ErrorAlert
        title="Statistics unavailable"
        message={error ?? "No data"}
        onRetry={load}
      />
    );
  }

  const { kpis, today } = stats;
  const hasQueueTrend = stats.queueLast7Days.some((d) => d.total > 0);
  const hasApptTrend = stats.appointmentsLast7Days.some((d) => d.total > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Your clinic today
          </h2>
          <p className="text-sm text-muted-foreground">
            Single-clinic metrics for {today} (UTC) · updated{" "}
            {new Date(stats.generatedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {showPatients && (
          <>
            <KpiCard
              label="Patients today"
              value={kpis.patientsCreatedToday}
              hint={`${kpis.patientsTotal} registered all time`}
              icon={Users}
            />
          </>
        )}
        {showAppointments && (
          <KpiCard
            label="Appointments today"
            value={kpis.appointmentsToday}
            hint={`${kpis.appointmentsArrivedToday} arrived · ${kpis.appointmentsScheduledToday} upcoming`}
            icon={CalendarCheck}
          />
        )}
        {showQueue && (
          <>
            <KpiCard
              label="Queue today"
              value={kpis.queueTotalToday}
              hint={`${kpis.queueWaiting} waiting · ${kpis.queueServing} serving`}
              icon={ListOrdered}
            />
            <KpiCard
              label="Waiting now"
              value={kpis.queueWaiting}
              hint="Walk-in queue"
              icon={Clock}
              accent={kpis.queueWaiting > 0}
            />
            <KpiCard
              label="Served today"
              value={kpis.queueCompletedToday}
              hint="Completed tokens"
              icon={CheckCircle2}
            />
            <KpiCard
              label="Avg wait"
              value={
                kpis.averageWaitMinutes != null
                  ? `${kpis.averageWaitMinutes}m`
                  : "—"
              }
              hint="Completed visits today"
              icon={Activity}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showQueue && (
          <ChartCard
            title="Queue activity (7 days)"
            description="Total tokens issued vs completed per day"
          >
            {hasQueueTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.queueLast7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queueTotalFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="queueDoneFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SERIES_PALETTE[2]} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={SERIES_PALETTE[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={chartTooltipStyle.contentStyle} labelStyle={chartTooltipStyle.labelStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={CHART_COLORS.primary}
                    fill="url(#queueTotalFill)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke={SERIES_PALETTE[2]}
                    fill="url(#queueDoneFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No queue activity in the last 7 days" />
            )}
          </ChartCard>
        )}

        {showAppointments && (
          <ChartCard
            title="Appointments (7 days)"
            description="Bookings per day with arrivals and cancellations"
          >
            {hasApptTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.appointmentsLast7Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                  <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={chartTooltipStyle.contentStyle} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="total" name="Booked" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="arrived" name="Arrived" fill={SERIES_PALETTE[2]} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill={SERIES_PALETTE[4]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No appointments in the last 7 days" />
            )}
          </ChartCard>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {showQueue && (
          <ChartCard
            title="Queue status today"
            description="Current breakdown of walk-in tokens"
            className="xl:col-span-1"
          >
            {queuePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queuePieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {queuePieData.map((_, index) => (
                      <Cell key={index} fill={SERIES_PALETTE[index % SERIES_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No queue entries today yet" />
            )}
          </ChartCard>
        )}

        {showAppointments && (
          <>
            <ChartCard
              title="Appointment status today"
              description="How today&apos;s bookings are progressing"
            >
              {appointmentPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                    >
                      {appointmentPieData.map((_, index) => (
                        <Cell key={index} fill={SERIES_PALETTE[index % SERIES_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No appointments scheduled for today" />
              )}
            </ChartCard>

            <ChartCard
              title="Peak hours today"
              description="Appointment volume by time slot"
            >
              {stats.peakHoursToday.some((s) => s.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.peakHoursToday}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                    <XAxis dataKey="slot" tick={chartAxisTick} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                    <Bar dataKey="count" name="Appointments" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No appointments today" />
              )}
            </ChartCard>

            <ChartCard
              title="Slot utilization today"
              description="Bookings vs capacity per slot"
              className="md:col-span-2 xl:col-span-1"
            >
              {slotChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={slotChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                    <XAxis type="number" domain={[0, 5]} tick={chartAxisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="slot"
                      width={72}
                      tick={chartAxisTick}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="booked" name="Booked" stackId="slot" fill={CHART_COLORS.primary} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="remaining" name="Available" stackId="slot" fill={CHART_COLORS.chart2} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No slots booked today" />
              )}
            </ChartCard>
          </>
        )}
      </div>

      {(showQueue || showAppointments) && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-wrap items-center gap-3 py-4 text-sm text-muted-foreground">
            <Activity className="size-4 shrink-0 text-primary" />
            <span>
              Charts refresh when you reload this page. Data is scoped to your
              clinic only.
            </span>
            {showQueue && (
              <span className="inline-flex items-center gap-1">
                <ListOrdered className="size-3.5" />
                Queue
              </span>
            )}
            {showAppointments && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                Appointments
              </span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
