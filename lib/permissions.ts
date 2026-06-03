import type { UserRole } from "@/types/auth";

/** Day-to-day clinic operations (single clinic tenant only). */
export const CLINIC_OPERATIONAL_ROLES: UserRole[] = ["admin", "receptionist"];

/** Clinic tenant profile + staff (clinic admin). */
export const CLINIC_ADMINISTRATION_ROLES: UserRole[] = ["admin"];

/** Platform operator — tenants, billing approvals, global user directory. */
export const PLATFORM_OPERATOR_ROLES: UserRole[] = ["platform_admin"];

/** Overview dashboard — clinic stats or platform-wide stats. */
export const OVERVIEW_ROLES: UserRole[] = [
  "admin",
  "receptionist",
  "platform_admin",
];

export type AppFeature =
  | "overview"
  | "patients"
  | "queue"
  | "appointments"
  | "appointmentsBook"
  | "administration"
  | "billing"
  | "paymentsAdmin"
  | "platformUsers";

export const FEATURE_ACCESS: Record<AppFeature, readonly UserRole[]> = {
  overview: OVERVIEW_ROLES,
  patients: CLINIC_OPERATIONAL_ROLES,
  queue: CLINIC_OPERATIONAL_ROLES,
  appointments: CLINIC_OPERATIONAL_ROLES,
  appointmentsBook: CLINIC_OPERATIONAL_ROLES,
  administration: [...CLINIC_ADMINISTRATION_ROLES, ...PLATFORM_OPERATOR_ROLES],
  billing: ["admin"],
  paymentsAdmin: PLATFORM_OPERATOR_ROLES,
  platformUsers: PLATFORM_OPERATOR_ROLES,
};

/** Longest prefix first — used by getFeatureForPath. */
const ROUTE_FEATURES: { prefix: string; feature: AppFeature }[] = [
  { prefix: "/dashboard/admin/payments", feature: "paymentsAdmin" },
  { prefix: "/dashboard/admin/users", feature: "platformUsers" },
  { prefix: "/dashboard/billing", feature: "billing" },
  { prefix: "/dashboard/admin", feature: "administration" },
  { prefix: "/dashboard/appointments/book", feature: "appointmentsBook" },
  { prefix: "/dashboard/appointments", feature: "appointments" },
  { prefix: "/dashboard/patients", feature: "patients" },
  { prefix: "/dashboard/queue", feature: "queue" },
  { prefix: "/dashboard", feature: "overview" },
];

export const NAV_LINKS: {
  href: string;
  label: string;
  feature: AppFeature;
  exact?: boolean;
}[] = [
  { href: "/dashboard", label: "Overview", feature: "overview", exact: true },
  { href: "/dashboard/patients", label: "Patients", feature: "patients" },
  { href: "/dashboard/queue", label: "Queue Management", feature: "queue" },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    feature: "appointments",
  },
  {
    href: "/dashboard/admin",
    label: "Administration",
    feature: "administration",
  },
  { href: "/dashboard/billing", label: "Billing", feature: "billing" },
  {
    href: "/dashboard/admin/payments",
    label: "Payments",
    feature: "paymentsAdmin",
  },
  {
    href: "/dashboard/admin/users",
    label: "All users",
    feature: "platformUsers",
  },
  {
    href: "/dashboard/appointments/book",
    label: "Book Appointment",
    feature: "appointmentsBook",
  },
];

export const NAV_GROUPS: { label: string; features: AppFeature[] }[] = [
  { label: "Overview", features: ["overview"] },
  {
    label: "Operations",
    features: ["patients", "queue", "appointments", "appointmentsBook"],
  },
  {
    label: "Administration",
    features: ["administration", "billing", "paymentsAdmin", "platformUsers"],
  },
];

export function canAccessFeature(
  role: UserRole | undefined,
  feature: AppFeature,
): boolean {
  if (!role) return false;
  return FEATURE_ACCESS[feature].includes(role);
}

export function getFeatureForPath(pathname: string): AppFeature {
  for (const { prefix, feature } of ROUTE_FEATURES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return feature;
    }
  }
  return "overview";
}

export function canAccessPath(
  role: UserRole | undefined,
  pathname: string,
): boolean {
  return canAccessFeature(role, getFeatureForPath(pathname));
}

/** First screen after login when user lands on a generic redirect target. */
export function getDefaultHomePath(role: UserRole): string {
  switch (role) {
    case "receptionist":
      return "/dashboard/patients";
    case "platform_admin":
      return "/dashboard/admin";
    default:
      return "/dashboard";
  }
}
