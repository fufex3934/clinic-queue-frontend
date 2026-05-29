import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Clinic admin",
  receptionist: "Receptionist",
  platform_admin: "Platform admin",
};

/** Roles clinic admins may assign when creating staff. */
export const CLINIC_STAFF_ROLES: UserRole[] = ["admin", "receptionist"];

/** Roles platform admins may assign (excludes creating more platform admins by default in UI). */
export const PLATFORM_ASSIGNABLE_ROLES: UserRole[] = [
  "admin",
  "receptionist",
];
