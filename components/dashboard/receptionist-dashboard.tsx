"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ListOrdered,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/shared/error-alert";
import { CurrentTokenCard } from "@/components/queue/current-token-card";
import { WaitingList } from "@/components/queue/waiting-list";
import { getErrorMessage } from "@/lib/errors";
import { getPatientName } from "@/lib/patient";
import { todayDateString } from "@/lib/date";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { appointmentService } from "@/services/appointmentService";
import { patientService } from "@/services/patientService";
import { queueService } from "@/services/queueService";
import { statsService } from "@/services/statsService";
import type { QueueEntry } from "@/types";
import { isClinicDashboardStats } from "@/types/stats";

export function ReceptionistDashboard() {
  const { scope, scopeKey, operationalClinicId, isScopeReady } =
    useOperationalScope();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadInFlightRef = useRef(false);
  const [kpis, setKpis] = useState({
    patientsCreatedToday: 0,
    servedToday: 0,
    appointmentsToday: 0,
    waiting: 0,
  });

  const load = useCallback(async () => {
    if (!isScopeReady) {
      setLoading(false);
      return;
    }
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    setStatsError(null);
    setLoading(true);
    try {
      const [queueRes, statsRes, patientsRes, apptRes] = await Promise.all([
        queueService.getToday(scope),
        statsService.getDashboard(),
        patientService.list({ ...scope, limit: 100, page: 1 }),
        appointmentService.getByDate(todayDateString(), scope),
      ]);

      setQueue(queueRes.data);

      const today = todayDateString();
      const patientsToday = patientsRes.data.items.filter((p) =>
        p.createdAt?.startsWith(today),
      ).length;

      if (isClinicDashboardStats(statsRes.data)) {
        setKpis({
          patientsCreatedToday:
            statsRes.data.kpis.patientsCreatedToday ?? patientsToday,
          servedToday: statsRes.data.kpis.queueCompletedToday,
          appointmentsToday: statsRes.data.kpis.appointmentsToday,
          waiting: statsRes.data.kpis.queueWaiting,
        });
      } else {
        setKpis({
          patientsCreatedToday: patientsToday,
          servedToday: queueRes.data.filter((q) => q.status === "done").length,
          appointmentsToday: apptRes.data.length,
          waiting: queueRes.data.filter((q) => q.status === "waiting").length,
        });
      }
    } catch (err: unknown) {
      setStatsError(getErrorMessage(err, "Failed to load operations"));
    } finally {
      loadInFlightRef.current = false;
      setLoading(false);
    }
  }, [scope, scopeKey, isScopeReady]);

  const refreshQueueOnly = useCallback(async () => {
    if (!isScopeReady) return;
    try {
      const { data } = await queueService.getToday(scope);
      setQueue(data);
      setKpis((prev) => ({
        ...prev,
        waiting: data.filter((q) => q.status === "waiting").length,
        servedToday: data.filter((q) => q.status === "done").length,
      }));
    } catch {
      /* silent refresh */
    }
  }, [scope, scopeKey, isScopeReady]);

  useEffect(() => {
    void load();
  }, [load, isScopeReady]);

  useRealtimeQueue(operationalClinicId, refreshQueueOnly, isScopeReady);

  const serving = useMemo(
    () => queue.find((e) => e.status === "serving") ?? null,
    [queue],
  );
  const waiting = useMemo(
    () => queue.filter((e) => e.status === "waiting"),
    [queue],
  );

  const handleServeNext = async () => {
    try {
      await queueService.serveNext(scope);
      await load();
    } catch (err: unknown) {
      setStatsError(getErrorMessage(err, "Failed to serve next patient"));
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading operations…</p>;
  }

  return (
    <div className="space-y-6">
      {statsError && (
        <ErrorAlert title="Error" message={statsError} onRetry={load} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Front desk — today
          </h2>
          <p className="text-sm text-muted-foreground">
            Operational view for reception staff
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Patients registered</p>
            <p className="text-2xl font-semibold tabular-nums">
              {kpis.patientsCreatedToday}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Served today</p>
            <p className="text-2xl font-semibold tabular-nums">
              {kpis.servedToday}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Appointments today</p>
            <p className="text-2xl font-semibold tabular-nums">
              {kpis.appointmentsToday}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button render={<Link href="/dashboard/patients" />}>
          <UserPlus className="mr-2 size-4" />
          Add patient
        </Button>
        <Button variant="outline" render={<Link href="/dashboard/queue" />}>
          <ListOrdered className="mr-2 size-4" />
          Add to queue
        </Button>
        <Button
          variant="outline"
          render={<Link href="/dashboard/appointments/book" />}
        >
          <CalendarDays className="mr-2 size-4" />
          Book appointment
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="space-y-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" />
                Now serving
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentTokenCard serving={serving} />
              {serving && (
                <p className="mt-2 text-sm font-medium">
                  {getPatientName(serving.patientId)}
                </p>
              )}
              <Button
                className="mt-4 w-full"
                onClick={() => void handleServeNext()}
                disabled={waiting.length === 0}
              >
                Serve next
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {kpis.waiting} waiting
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Waiting queue</CardTitle>
            <CardDescription>Today&apos;s walk-in line</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitingList entries={waiting} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
