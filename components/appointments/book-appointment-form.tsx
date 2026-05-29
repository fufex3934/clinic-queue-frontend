"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus } from "lucide-react";
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
import { PatientPicker } from "@/components/shared/patient-picker";
import {
  CLINIC_TIME_SLOTS,
  MAX_APPOINTMENTS_PER_SLOT,
} from "@/lib/constants/time-slots";
import { todayDateString } from "@/lib/date";
import { getErrorMessage } from "@/lib/errors";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { appointmentService } from "@/services/appointmentService";
import { patientService } from "@/services/patientService";
import type { Appointment, Patient } from "@/types";

export function BookAppointmentForm() {
  const { scope, scopeKey, isScopeReady } = useOperationalScope();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(todayDateString());
  const [timeSlot, setTimeSlot] = useState(CLINIC_TIME_SLOTS[0] ?? "09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    if (!isScopeReady) return;
    const { data } = await patientService.list(scope);
    setPatients(data);
  }, [scope, scopeKey, isScopeReady]);

  const loadAppointments = useCallback(async (selectedDate: string) => {
    if (!isScopeReady) return;
    const { data } = await appointmentService.getByDate(selectedDate, scope);
    setAppointments(data);
  }, [scope, scopeKey, isScopeReady]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients, isScopeReady]);

  useEffect(() => {
    void loadAppointments(date);
  }, [date, loadAppointments, isScopeReady]);

  const slotCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const slot of CLINIC_TIME_SLOTS) {
      counts[slot] = 0;
    }
    for (const apt of appointments) {
      if (
        apt.status !== "cancelled" &&
        apt.status !== "completed" &&
        apt.status !== "no_show"
      ) {
        counts[apt.timeSlot] = (counts[apt.timeSlot] ?? 0) + 1;
      }
    }
    return counts;
  }, [appointments]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await appointmentService.book({ patientId, date, timeSlot }, scope);
      setSuccess(`Booked ${timeSlot} on ${date}`);
      await loadAppointments(date);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to book appointment"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PlatformClinicSelector />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="size-5" />
            Book appointment
          </CardTitle>
          <CardDescription>
            Max {MAX_APPOINTMENTS_PER_SLOT} patients per slot per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBook} className="space-y-4">
            <PatientPicker
              patients={patients}
              value={patientId}
              onChange={setPatientId}
              disabled={loading}
            />
            <div className="space-y-2">
              <Label htmlFor="book-date">Date</Label>
              <Input
                id="book-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-slot">Time slot</Label>
              <select
                id="book-slot"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                {CLINIC_TIME_SLOTS.map((slot) => {
                  const count = slotCounts[slot] ?? 0;
                  const full = count >= MAX_APPOINTMENTS_PER_SLOT;
                  return (
                    <option key={slot} value={slot} disabled={full}>
                      {slot} ({count}/{MAX_APPOINTMENTS_PER_SLOT})
                      {full ? " — FULL" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 dark:text-green-400" role="status">
                {success}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !patientId}>
              {loading ? "Booking…" : "Book appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
