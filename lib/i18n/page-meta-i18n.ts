import type { PageMeta } from "@/lib/page-meta";
import type { MessageKey } from "./catalog/en";
import type { Locale } from "./messages";
import { t } from "./messages";

type MetaKeys = {
  title: MessageKey;
  description: MessageKey;
  breadcrumbs?: { label: MessageKey; href?: string }[];
};

const PAGE_META_KEYS: Record<string, MetaKeys> = {
  "/dashboard": {
    title: "metaOverview",
    description: "metaOverviewDesc",
    breadcrumbs: [{ label: "dashboard" }],
  },
  "/dashboard/patients": {
    title: "metaPatients",
    description: "metaPatientsDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaPatients" },
    ],
  },
  "/dashboard/today": {
    title: "metaToday",
    description: "metaTodayDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaToday" },
    ],
  },
  "/dashboard/queue": {
    title: "metaQueue",
    description: "metaQueueDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaQueue" },
    ],
  },
  "/dashboard/queue/display": {
    title: "metaQueueDisplay",
    description: "metaQueueDisplayDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaQueue", href: "/dashboard/queue" },
      { label: "breadcrumbDisplay" },
    ],
  },
  "/dashboard/appointments": {
    title: "metaAppointments",
    description: "metaAppointmentsDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaAppointments" },
    ],
  },
  "/dashboard/appointments/book": {
    title: "metaBookAppointment",
    description: "metaBookAppointmentDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaAppointments", href: "/dashboard/appointments" },
      { label: "breadcrumbBook" },
    ],
  },
  "/dashboard/admin": {
    title: "metaAdmin",
    description: "metaAdminDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "breadcrumbAdmin" },
    ],
  },
  "/dashboard/billing": {
    title: "metaBilling",
    description: "metaBillingDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaBilling" },
    ],
  },
  "/dashboard/admin/payments": {
    title: "metaPayments",
    description: "metaPaymentsDesc",
    breadcrumbs: [
      { label: "dashboard", href: "/dashboard" },
      { label: "metaPayments" },
    ],
  },
};

export function getTranslatedPageMeta(
  pathname: string,
  locale: Locale,
): PageMeta {
  const keys = PAGE_META_KEYS[pathname];
  if (keys) {
    return {
      title: t(locale, keys.title),
      description: t(locale, keys.description),
      breadcrumbs: keys.breadcrumbs?.map((c) => ({
        label: t(locale, c.label),
        href: c.href,
      })),
    };
  }

  const patientDetail = pathname.match(/^\/dashboard\/patients\/([^/]+)$/);
  if (patientDetail) {
    return {
      title: t(locale, "metaPatientDetails"),
      description: t(locale, "metaPatientDetailsDesc"),
      breadcrumbs: [
        { label: t(locale, "dashboard"), href: "/dashboard" },
        { label: t(locale, "metaPatients"), href: "/dashboard/patients" },
        { label: t(locale, "breadcrumbDetails") },
      ],
    };
  }

  return {
    title: t(locale, "metaDefault"),
    description: t(locale, "metaDefaultDesc"),
    breadcrumbs: [{ label: t(locale, "dashboard") }],
  };
}
