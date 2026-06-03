import type { Clinic } from "@/types/clinic";

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";
const DEFAULT_MAX_PER_SLOT = 5;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function getClinicSettings(clinic: Clinic | null | undefined) {
  return {
    workingHoursStart: clinic?.workingHoursStart ?? DEFAULT_START,
    workingHoursEnd: clinic?.workingHoursEnd ?? DEFAULT_END,
    maxAppointmentsPerSlot:
      clinic?.maxAppointmentsPerSlot ?? DEFAULT_MAX_PER_SLOT,
  };
}

export function generateClinicTimeSlots(
  workingHoursStart: string,
  workingHoursEnd: string,
  intervalMinutes = 30,
): string[] {
  const start = timeToMinutes(workingHoursStart);
  const end = timeToMinutes(workingHoursEnd);
  const slots: string[] = [];
  for (let m = start; m <= end; m += intervalMinutes) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export function getTimeSlotsForClinic(clinic: Clinic | null | undefined): string[] {
  const { workingHoursStart, workingHoursEnd } = getClinicSettings(clinic);
  return generateClinicTimeSlots(workingHoursStart, workingHoursEnd);
}
