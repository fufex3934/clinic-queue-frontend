import { DEFAULT_CLINIC_TIMEZONE } from "@/lib/clinic-display";

/** Calendar date YYYY-MM-DD in the clinic IANA timezone. */
export function todayDateStringInTimeZone(
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDisplayDateInTimeZone(
  isoDate: string,
  timeZone: string = DEFAULT_CLINIC_TIMEZONE,
): string {
  const instant = new Date(`${isoDate}T12:00:00.000Z`);
  return instant.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone,
  });
}

/** Short label for dashboard footers, e.g. "Addis Ababa". */
export function formatTimeZoneLabel(timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      timeZoneName: "long",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}
