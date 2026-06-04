import { todayDateStringInTimeZone } from "@/lib/clinic-date";
import { DEFAULT_CLINIC_TIMEZONE } from "@/lib/clinic-display";

/** Today's date as YYYY-MM-DD (browser local calendar). Prefer `useClinicToday()` in dashboard UI. */
export function todayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Today in clinic timezone — use when clinic context is not available. */
export function todayDateStringForClinic(timeZone?: string): string {
  return todayDateStringInTimeZone(
    timeZone?.trim() || DEFAULT_CLINIC_TIMEZONE,
  );
}

export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
