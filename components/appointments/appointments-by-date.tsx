"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getErrorMessage } from "@/lib/errors";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import { useAuth } from "@/contexts/auth-provider";
import { canAccessFeature } from "@/lib/permissions";
import { appointmentService } from "@/services/appointmentService";
import type { Appointment } from "@/types";
import {
  AppointmentFlowHint,
  AppointmentStatusBadge,
} from "./appointment-status-badge";
import { AppointmentsLoadingSkeleton } from "./appointments-loading-skeleton";

export function AppointmentsByDate() {
  const { user } = useAuth();
  const canBook = canAccessFeature(user?.role, "appointmentsBook");
  const [date, setDate] = useState(todayDateString());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [arrivingId, setArrivingId] = useState<string | null>(null);

  const loadAppointments = useCallback(async (selectedDate: string) => {
    if (!selectedDate) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await appointmentService.getByDate(selectedDate);
      setAppointments(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load appointments"));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments(date);
  }, [date, loadAppointments]);

  const bySlot = appointments.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const slot = apt.timeSlot;
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(apt);
    return acc;
  }, {});

  const slots = Object.keys(bySlot).sort();
  const isToday = date === todayDateString();

  const handleArrive = async (appointmentId: string) => {
    setArrivingId(appointmentId);
    setError(null);
    try {
      await appointmentService.arrive(appointmentId);
      await loadAppointments(date);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to check in patient"));
    } finally {
      setArrivingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            Select date
          </CardTitle>
          <CardDescription>
            View booked visits for any day — slots show up to 5 patients each
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
                  const nearlyFull = count >= 4;

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
                          {count}/5 booked
                        </span>
                      </h3>
                      <Table>
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
                            const canArrive =
                              isToday &&
                              (apt.status === "scheduled" ||
                                apt.status === "confirmed");

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
                                  {canArrive ? (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      disabled={arrivingId === apt._id}
                                      onClick={() => handleArrive(apt._id)}
                                    >
                                      <LogIn className="mr-1 size-3" />
                                      {arrivingId === apt._id
                                        ? "Checking in…"
                                        : "Mark arrived"}
                                    </Button>
                                  ) : apt.status === "arrived" ? (
                                    <span className="text-xs text-muted-foreground">
                                      In queue flow
                                    </span>
                                  ) : null}
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
