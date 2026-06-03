"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CalendarX2, LogIn, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorAlert } from "@/components/shared/error-alert";
import { formatDisplayDate, todayDateString } from "@/lib/date";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import { useAuth } from "@/contexts/auth-provider";
import { canAccessFeature } from "@/lib/permissions";
import { ActiveClinicSelector } from "@/components/shared/active-clinic-banner";
import { useClinicContext } from "@/contexts/clinic-context";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { useRealtimeAppointments } from "@/hooks/use-realtime-appointments";
import { getClinicSettings } from "@/lib/clinic-settings";
import {
  canArriveAppointment,
  canCancelAppointment,
  canCompleteAppointment,
  canConfirmAppointment,
  canMarkNoShow,
} from "@/lib/appointment-actions";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types";
import {
  AppointmentFlowHint,
  AppointmentStatusBadge,
} from "./appointment-status-badge";
import { AppointmentsLoadingSkeleton } from "./appointments-loading-skeleton";

export function AppointmentsByDate() {
  const confirm = useConfirm();
  const { user } = useAuth();
  const { scope, scopeKey, isScopeReady, operationalClinicId } =
    useOperationalScope();
  const { activeClinic } = useClinicContext();
  const { maxAppointmentsPerSlot } = getClinicSettings(activeClinic);
  const canBook = canAccessFeature(user?.role, "appointmentsBook");
  const [date, setDate] = useState(todayDateString());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arrivingId, setArrivingId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadAppointments = useCallback(async (selectedDate: string) => {
    if (!selectedDate || !isScopeReady) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await appointmentService.getByDate(selectedDate, scope);
      setAppointments(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load appointments"));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [scope, scopeKey, isScopeReady]);

  useEffect(() => {
    loadAppointments(date);
  }, [date, loadAppointments, isScopeReady]);

  useRealtimeAppointments(
    operationalClinicId,
    () => void loadAppointments(date),
    isScopeReady,
  );

  const patchAppointment = (updated: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a._id === updated._id ? updated : a)),
    );
  };

  const runStatusAction = async (
    id: string,
    action: () => Promise<{ data: Appointment }>,
    success: { title: string; description?: string },
  ) => {
    setArrivingId(id);
    setError(null);
    try {
      const { data } = await action();
      patchAppointment(data);
      notifySuccess(success.title, success.description);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update appointment"));
      notifyError(err, "Could not update appointment");
    } finally {
      setArrivingId(null);
    }
  };

  const runDestructiveAction = async (
    apt: Appointment,
    action: () => Promise<{ data: Appointment }>,
    dialog: { title: string; description: string; confirmLabel: string },
    success: { title: string; description?: string },
  ) => {
    const ok = await confirm({
      ...dialog,
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    void runStatusAction(apt._id, action, success);
  };

  const filteredAppointments = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return appointments.filter((apt) => {
      if (statusFilter && apt.status !== statusFilter) return false;
      if (!q) return true;
      const name = getPatientName(apt.patientId).toLowerCase();
      const phone = getPatientPhone(apt.patientId).toLowerCase();
      return name.includes(q) || phone.includes(q) || apt.timeSlot.includes(q);
    });
  }, [appointments, filterText, statusFilter]);

  const bySlot = filteredAppointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const slot = apt.timeSlot;
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(apt);
    return acc;
  }, {});

  const slots = Object.keys(bySlot).sort();
  const isToday = date === todayDateString();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ActiveClinicSelector />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            Select date
          </CardTitle>
          <CardDescription>
            View booked visits for any day — capacity follows your clinic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="appointment-date">Date</Label>
            <Input
              id="appointment-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="w-[200px]"
            />
          </div>
          {canBook && (
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/dashboard/appointments/book" />}
            >
              Book new
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => loadAppointments(date)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : formatDisplayDate(date)}
          </p>
        </CardContent>
      </Card>

      {error && (
        <ErrorAlert
          title="Could not load schedule"
          message={error}
          onRetry={() => loadAppointments(date)}
        />
      )}

      {!loading && appointments.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-6">
            <div className="min-w-[12rem] flex-1 space-y-1">
              <Label htmlFor="apt-filter" className="text-xs text-muted-foreground">
                Filter this day
              </Label>
              <Input
                id="apt-filter"
                placeholder="Patient name, phone, or time slot…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="apt-status" className="text-xs text-muted-foreground">
                Status
              </Label>
              <select
                id="apt-status"
                className="flex h-9 min-w-[9rem] rounded-md border border-input bg-transparent px-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="arrived">Arrived</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No-show</option>
              </select>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredAppointments.length} of {appointments.length} on this day
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <AppointmentsLoadingSkeleton />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
            <CardDescription>
              {appointments.length} appointment
              {appointments.length === 1 ? "" : "s"} on this date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 && !error ? (
              <EmptyState
                icon={CalendarX2}
                title="No appointments scheduled"
                description="There are no bookings for this date. Try another day or add appointments through the API when booking is enabled in the UI."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(todayDateString())}
                  >
                    Jump to today
                  </Button>
                }
              />
            ) : (
              <div className="space-y-8">
                {slots.map((slot) => {
                  const count = bySlot[slot].length;
                  const nearlyFull = count >= maxAppointmentsPerSlot - 1;

                  return (
                    <div key={slot}>
                      <h3 className="mb-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="text-primary">{slot}</span>
                        <span
                          className={
                            nearlyFull
                              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                              : "text-xs font-normal text-muted-foreground"
                          }
                        >
                          {count}/{maxAppointmentsPerSlot} booked
                        </span>
                      </h3>
                      <Table className="table-zebra">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead className="hidden sm:table-cell">Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bySlot[slot].map((apt) => {
                            const busy = arrivingId === apt._id;

                            return (
                              <TableRow key={apt._id}>
                                <TableCell>{getPatientName(apt.patientId)}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  {getPatientPhone(apt.patientId)}
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <AppointmentStatusBadge status={apt.status} />
                                    <AppointmentFlowHint status={apt.status} />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex flex-wrap justify-end gap-1">
                                    {canConfirmAppointment(apt.status) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={() =>
                                          void runStatusAction(
                                            apt._id,
                                            () =>
                                              appointmentService.confirm(
                                                apt._id,
                                                scope,
                                              ),
                                            {
                                              title: "Appointment confirmed",
                                              description: `${getPatientName(apt.patientId)} is confirmed for ${apt.timeSlot}.`,
                                            },
                                          )
                                        }
                                      >
                                        Confirm
                                      </Button>
                                    )}
                                    {canArriveAppointment(apt.status, isToday) && (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={busy}
                                        onClick={() =>
                                          void runStatusAction(
                                            apt._id,
                                            async () => {
                                              const res =
                                                await appointmentService.arrive(
                                                  apt._id,
                                                  scope,
                                                );
                                              return {
                                                data: res.data.appointment,
                                              };
                                            },
                                            {
                                              title: "Patient arrived",
                                              description: `${getPatientName(apt.patientId)} was added to the queue.`,
                                            },
                                          )
                                        }
                                      >
                                        <LogIn className="mr-1 size-3" />
                                        Arrived
                                      </Button>
                                    )}
                                    {canCompleteAppointment(apt.status) && (
                                      <Button
                                        size="sm"
                                        variant="default"
                                        disabled={busy}
                                        onClick={() =>
                                          void runStatusAction(
                                            apt._id,
                                            () =>
                                              appointmentService.complete(
                                                apt._id,
                                                scope,
                                              ),
                                            {
                                              title: "Visit completed",
                                              description: `${getPatientName(apt.patientId)}'s appointment is marked complete.`,
                                            },
                                          )
                                        }
                                      >
                                        Complete
                                      </Button>
                                    )}
                                    {canMarkNoShow(apt.status) && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled={busy}
                                        onClick={() =>
                                          void runDestructiveAction(
                                            apt,
                                            () =>
                                              appointmentService.noShow(
                                                apt._id,
                                                scope,
                                              ),
                                            {
                                              title: "Mark as no-show?",
                                              description: `${getPatientName(apt.patientId)} did not attend this slot.`,
                                              confirmLabel: "Mark no-show",
                                            },
                                            {
                                              title: "Marked as no-show",
                                              description: "The appointment was updated.",
                                            },
                                          )
                                        }
                                      >
                                        No-show
                                      </Button>
                                    )}
                                    {canCancelAppointment(apt.status) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={() =>
                                          void runDestructiveAction(
                                            apt,
                                            () =>
                                              appointmentService.cancel(
                                                apt._id,
                                                scope,
                                              ),
                                            {
                                              title: "Cancel appointment?",
                                              description: `${getPatientName(apt.patientId)} at ${apt.timeSlot} will be cancelled.`,
                                              confirmLabel: "Cancel appointment",
                                            },
                                            {
                                              title: "Appointment cancelled",
                                              description: "The slot is available for another booking.",
                                            },
                                          )
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                    {apt.status === "arrived" && (
                                      <span className="text-xs text-muted-foreground">
                                        In queue
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
