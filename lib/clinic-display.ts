import type { Clinic } from "@/types/clinic";

/** Default IANA timezone for new clinics (Ethiopia). */
export const DEFAULT_CLINIC_TIMEZONE = "Africa/Addis_Ababa";

/** Common IANA timezones for clinic setup */
export const CLINIC_TIMEZONE_OPTIONS = [
  { value: DEFAULT_CLINIC_TIMEZONE, label: "Africa/Addis_Ababa (Ethiopia)" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Yangon", label: "Asia/Yangon (Myanmar)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok" },
  { value: "Asia/Singapore", label: "Asia/Singapore" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata" },
  { value: "Asia/Dubai", label: "Asia/Dubai" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
];

export function formatClinicAddress(clinic: Pick<
  Clinic,
  "location" | "addressLine" | "city" | "country"
>): string {
  const parts = [
    clinic.addressLine?.trim(),
    clinic.city?.trim(),
    clinic.country?.trim(),
  ].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }
  return clinic.location?.trim() || "—";
}

export function clinicContactSummary(
  clinic: Pick<Clinic, "phone" | "email" | "timezone">,
): string {
  const parts: string[] = [];
  if (clinic.phone?.trim()) parts.push(clinic.phone.trim());
  if (clinic.email?.trim()) parts.push(clinic.email.trim());
  if (clinic.timezone?.trim()) parts.push(clinic.timezone.trim());
  return parts.length > 0 ? parts.join(" · ") : "—";
}
