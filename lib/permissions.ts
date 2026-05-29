import type { UserRole } from "@/types/auth";

/** Day-to-day clinic operations (single clinic). */
export const OPERATIONAL_ROLES: UserRole[] = ["admin", "receptionist"];

/** Clinic / platform staff management. */
export const ADMINISTRATION_ROLES: UserRole[] = ["admin", "platform_admin"];

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
  | "administration";

export const FEATURE_ACCESS: Record<AppFeature, readonly UserRole[]> = {
  overview: OVERVIEW_ROLES,
  patients: OPERATIONAL_ROLES,
  queue: OPERATIONAL_ROLES,
  appointments: OPERATIONAL_ROLES,
  appointmentsBook: OPERATIONAL_ROLES,
  administration: ADMINISTRATION_ROLES,
};

/** Longest prefix first — used by getFeatureForPath. */
const ROUTE_FEATURES: { prefix: string; feature: AppFeature }[] = [
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
      return "/dashboard";
    default:
      return "/dashboard";
  }
}
