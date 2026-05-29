import type { UserRole } from "@/types/auth";

const STORAGE_KEY = "clinic_queue_operational_clinic_id";

export function getStoredOperationalClinicId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredOperationalClinicId(clinicId: string): void {
  localStorage.setItem(STORAGE_KEY, clinicId);
}

export function clearStoredOperationalClinicId(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Query params for platform admin operational API calls. */
export function clinicScopeParams(
  role: UserRole | undefined,
  operationalClinicId: string | null,
): { clinicId?: string } {
  if (role === "platform_admin" && operationalClinicId) {
    return { clinicId: operationalClinicId };
  }
  return {};
}
