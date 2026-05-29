import type { AppointmentStatus } from "@/types";

export function canConfirmAppointment(status: AppointmentStatus): boolean {
  return status === "scheduled";
}

export function canCancelAppointment(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed";
}

export function canArriveAppointment(
  status: AppointmentStatus,
  isToday: boolean,
): boolean {
  return (
    isToday && (status === "scheduled" || status === "confirmed")
  );
}

export function canCompleteAppointment(status: AppointmentStatus): boolean {
  return (
    status === "scheduled" ||
    status === "confirmed" ||
    status === "arrived"
  );
}

export function canMarkNoShow(status: AppointmentStatus): boolean {
  return status === "scheduled" || status === "confirmed";
}
