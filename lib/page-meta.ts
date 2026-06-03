export type PageMeta = {
  title: string;
  description: string;
  breadcrumbs?: { label: string; href?: string }[];
};

const PAGE_META: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Overview",
    description: "Clinic operations at a glance",
    breadcrumbs: [{ label: "Dashboard" }],
  },
  "/dashboard/patients": {
    title: "Patients",
    description: "Register and search clinic patients",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Patients" }],
  },
  "/dashboard/queue": {
    title: "Queue",
    description: "Serve patients and monitor today's waiting line",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Queue" }],
  },
  "/dashboard/appointments": {
    title: "Appointments",
    description: "View scheduled visits by date",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Appointments" },
    ],
  },
  "/dashboard/appointments/book": {
    title: "Book appointment",
    description: "Schedule a visit with slot availability",
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Appointments", href: "/dashboard/appointments" },
      { label: "Book" },
    ],
  },
  "/dashboard/admin": {
    title: "Administration",
    description: "Clinic and staff management",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }],
  },
  "/dashboard/billing": {
    title: "Billing",
    description: "Subscription and payment history",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }],
  },
  "/dashboard/payments": {
    title: "Payments",
    description: "Review and approve clinic subscription payments",
    breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Payments" }],
  },
};

export function getPageMeta(pathname: string): PageMeta {
  if (PAGE_META[pathname]) return PAGE_META[pathname]!;

  const patientDetail = pathname.match(/^\/dashboard\/patients\/([^/]+)$/);
  if (patientDetail) {
    return {
      title: "Patient details",
      description: "Profile, visits, and queue history",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Patients", href: "/dashboard/patients" },
        { label: "Details" },
      ],
    };
  }

  return {
    title: "Dashboard",
    description: "Clinic queue system",
    breadcrumbs: [{ label: "Dashboard" }],
  };
}
