export type RenewalStatus =
  | "none"
  | "active"
  | "expiring_soon"
  | "grace"
  | "expired";

export const RENEWAL_WARNING_DAYS = 7;

export function formatRenewDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function renewalStatusLabel(status: RenewalStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "expiring_soon":
      return "Renewal due soon";
    case "grace":
      return "Grace period";
    case "expired":
      return "Expired";
    default:
      return "No subscription";
  }
}

export function renewalStatusVariant(
  status: RenewalStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "expiring_soon":
      return "secondary";
    case "grace":
      return "outline";
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
}

export function daysUntilRenewLabel(days: number | null | undefined): string {
  if (days == null) return "—";
  if (days < 0) return `${Math.abs(days)} day(s) overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export function renewalAlertStorageKey(
  userId: string,
  scopeId: string,
  renewalStatus: string,
  renewDate: string | null,
): string {
  return `renewal-alert:${userId}:${scopeId}:${renewalStatus}:${renewDate ?? "none"}`;
}
