"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ListOrdered,
  Monitor,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { CurrentTokenCard } from "@/components/queue/current-token-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorAlert } from "@/components/shared/error-alert";
import { useLocale } from "@/contexts/locale-provider";
import { useRealtimeAppointments } from "@/hooks/use-realtime-appointments";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { todayDateString } from "@/lib/date";
import { getErrorMessage } from "@/lib/errors";
import { getPatientName } from "@/lib/patient";
import { cn } from "@/lib/utils";
import { appointmentService } from "@/services/appointmentService";
import { queueService } from "@/services/queueService";
import type { Appointment, QueueEntry } from "@/types";

export function TodayOperations() {
  const { translate } = useLocale();
  const {
    scope,
    scopeKey,
    operationalClinicId,
    isScopeReady,
    isPlatformView,
  } = useOperationalScope();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isScopeReady) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const today = todayDateString();
      const [apptRes, queueRes] = await Promise.all([
        appointmentService.getByDate(today, scope),
        queueService.getToday(scope),
      ]);
      setAppointments(apptRes.data);
      setQueue(queueRes.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load today's operations"));
    } finally {
      setLoading(false);
    }
  }, [scope, scopeKey, isScopeReady]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshQueue = useCallback(async () => {
    if (!isScopeReady) return;
    try {
      const { data } = await queueService.getToday(scope);
      setQueue(data);
    } catch {
      /* silent */
    }
  }, [scope, scopeKey, isScopeReady]);

  const refreshAppointments = useCallback(async () => {
    if (!isScopeReady) return;
    try {
      const { data } = await appointmentService.getByDate(
        todayDateString(),
        scope,
      );
      setAppointments(data);
    } catch {
      /* silent */
    }
  }, [scope, scopeKey, isScopeReady]);

  useRealtimeQueue(operationalClinicId, refreshQueue, isScopeReady);
  useRealtimeAppointments(operationalClinicId, refreshAppointments, isScopeReady);

  const serving = useMemo(
    () => queue.find((e) => e.status === "serving") ?? null,
    [queue],
  );

  const waitingCount = useMemo(
    () => queue.filter((e) => e.status === "waiting").length,
    [queue],
  );

  const patientIdsInQueue = useMemo(() => {
    const ids = new Set<string>();
    for (const e of queue) {
      const pid =
        typeof e.patientId === "string" ? e.patientId : e.patientId?._id;
      if (pid) ids.add(pid);
    }
    return ids;
  }, [queue]);

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        a.timeSlot.localeCompare(b.timeSlot),
      ),
    [appointments],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PlatformClinicSelector />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {translate("todayOperations")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {translate("todaySubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="mr-2 size-4" />
            {translate("refresh")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/dashboard/queue/display" target="_blank" />}
          >
            <Monitor className="mr-2 size-4" />
            {translate("openTvMode")}
          </Button>
          <Button render={<Link href="/dashboard/queue" />}>
            <ListOrdered className="mr-2 size-4" />
            {translate("navQueue")}
          </Button>
        </div>
      </div>

      {isPlatformView && !isScopeReady && (
        <p className="text-sm text-muted-foreground">
          {translate("selectClinicPrompt")}
        </p>
      )}

      {error && (
        <ErrorAlert
          title={translate("error")}
          message={error}
          onRetry={() => void load()}
        />
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{translate("loading")}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <CurrentTokenCard serving={serving} />
            <p className="text-center text-sm text-muted-foreground">
              {waitingCount} {translate("patientsWaiting")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="size-5" />
                {translate("appointmentsToday")}
              </CardTitle>
              <CardDescription>{translate("scheduledVisits")}</CardDescription>
            </CardHeader>
            <CardContent>
              {sortedAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {translate("noAppointments")}
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {sortedAppointments.map((a) => {
                    const pid =
                      typeof a.patientId === "string"
                        ? a.patientId
                        : a.patientId?._id;
                    const inQueue = pid ? patientIdsInQueue.has(pid) : false;
                    return (
                      <li
                        key={a._id}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="font-medium tabular-nums">
                            {a.timeSlot}
                          </p>
                          <p className="truncate text-sm">
                            {getPatientName(a.patientId)}
                          </p>
                          <p
                            className={cn(
                              "mt-0.5 flex items-center gap-1 text-xs",
                              inQueue
                                ? "text-status-serving"
                                : "text-muted-foreground",
                            )}
                          >
                            <UserCheck className="size-3.5" />
                            {inQueue
                              ? translate("arrived")
                              : translate("notArrived")}
                          </p>
                        </div>
                        <AppointmentStatusBadge status={a.status} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
