import type { MessageKey } from "./catalog/en";

const NAV_LABEL_BY_HREF: Record<string, MessageKey> = {
  "/dashboard": "navOverview",
  "/dashboard/patients": "navPatients",
  "/dashboard/today": "navToday",
  "/dashboard/queue": "navQueueMgmt",
  "/dashboard/appointments": "navAppointments",
  "/dashboard/appointments/book": "navBookAppointment",
  "/dashboard/admin": "navAdmin",
  "/dashboard/billing": "navBilling",
  "/dashboard/admin/payments": "navPayments",
  "/dashboard/admin/users": "navAllUsers",
};

const NAV_GROUP_LABEL_BY_ID: Record<string, MessageKey> = {
  overview: "navGroupOverview",
  operations: "navGroupOperations",
  administration: "navGroupAdministration",
};

export function navLabelKey(href: string): MessageKey {
  return NAV_LABEL_BY_HREF[href] ?? "navOverview";
}

export function navGroupLabelKey(groupId: string): MessageKey {
  return NAV_GROUP_LABEL_BY_ID[groupId] ?? "navGroupOverview";
}
