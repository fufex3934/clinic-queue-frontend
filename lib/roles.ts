import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Clinic admin",
  receptionist: "Receptionist",
  platform_admin: "Platform admin",
};

/** Roles clinic admins may create or assign (receptionists only). */
export const CLINIC_MANAGED_STAFF_ROLES: UserRole[] = ["receptionist"];

/** Roles platform operators may create for a tenant (not platform_admin). */
export const PLATFORM_CLINIC_ACCOUNT_ROLES: UserRole[] = ["admin", "receptionist"];
