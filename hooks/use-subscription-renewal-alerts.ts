"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { useNotifications } from "@/contexts/notifications-provider";
import {
  daysUntilRenewLabel,
  formatRenewDate,
  renewalAlertStorageKey,
} from "@/lib/subscription-renewal";
import { paymentService } from "@/services/paymentService";

function wasAlertShown(key: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(key) === "1";
}

function markAlertShown(key: string): void {
  localStorage.setItem(key, "1");
}

export function useSubscriptionRenewalAlerts(enabled = true): void {
  const { user } = useAuth();
  const { push } = useNotifications();
  const pushRef = useRef(push);
  pushRef.current = push;

  useEffect(() => {
    if (!enabled || !user) return;

    const run = async () => {
      try {
        if (user.role === "platform_admin") {
          const { data } = await paymentService.listAdminSubscriptions({
            limit: 100,
            sortBy: "renewDate",
            sortOrder: "asc",
          });
          for (const row of data.items) {
            if (!row.shouldNotifyRenewal) continue;
            const key = renewalAlertStorageKey(
              user.id,
              row.clinicId,
              row.renewalStatus,
              row.renewDate,
            );
            if (wasAlertShown(key)) continue;

            const daysLabel = daysUntilRenewLabel(row.daysUntilRenew);
            let title = `${row.clinicName}: renewal due soon`;
            let description = `Next term payment by ${formatRenewDate(row.renewDate)} (${daysLabel}). Review under Payments or deactivate the clinic if unpaid.`;
            let kind: "info" | "warning" = "info";

            if (row.renewalStatus === "grace") {
              title = `${row.clinicName}: in grace period`;
              description = `Subscription ended ${formatRenewDate(row.renewDate)}. ${row.daysLeftInGrace ?? 0} day(s) of grace remain — deactivate if they do not pay.`;
              kind = "warning";
            } else if (row.renewalStatus === "expired") {
              title = `${row.clinicName}: subscription expired`;
              description = `No active subscription. Deactivate the clinic or wait for a new payment request.`;
              kind = "warning";
            }

            pushRef.current({
              title,
              description,
              kind,
              href: "/dashboard/admin/payments",
            });
            markAlertShown(key);
          }
          return;
        }

        if (user.role !== "admin") return;

        const { data } = await paymentService.getBilling();
        const alert = data.renewalAlert;
        if (!alert || !data.subscription.shouldNotifyRenewal) return;

        const key = renewalAlertStorageKey(
          user.id,
          user.clinicId,
          data.subscription.renewalStatus,
          data.subscription.renewDate,
        );
        if (wasAlertShown(key)) return;

        pushRef.current({
          title: alert.title,
          description: alert.message,
          kind: alert.level === "error" ? "warning" : alert.level,
          href: "/dashboard/billing",
        });
        markAlertShown(key);
      } catch {
        // Billing alerts are best-effort on dashboard load
      }
    };

    void run();
  }, [enabled, user]);
}
