/**
 * @deprecated Use clinic settings from API via `lib/clinic-settings.ts`.
 * Defaults only — booking UI loads per-clinic values from ClinicContext.
 */
import {
  generateClinicTimeSlots,
  getClinicSettings,
} from "@/lib/clinic-settings";
import type { Clinic } from "@/types/clinic";

const defaults = getClinicSettings(null);

export const CLINIC_TIME_SLOTS = generateClinicTimeSlots(
  defaults.workingHoursStart,
  defaults.workingHoursEnd,
);

export const MAX_APPOINTMENTS_PER_SLOT = defaults.maxAppointmentsPerSlot;

export function getSlotsForClinic(clinic: Clinic | null | undefined) {
  return generateClinicTimeSlots(
    clinic?.workingHoursStart ?? defaults.workingHoursStart,
    clinic?.workingHoursEnd ?? defaults.workingHoursEnd,
  );
}
