"use client";

import type { ReactNode } from "react";
import { ConfirmDialogProvider } from "@/contexts/confirm-dialog-provider";
import { LocaleProvider } from "@/contexts/locale-provider";
import { NotificationsProvider } from "@/contexts/notifications-provider";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useSubscriptionRenewalAlerts } from "@/hooks/use-subscription-renewal-alerts";

function RealtimeNotifications() {
  useRealtimeNotifications(true);
  return null;
}

function SubscriptionRenewalAlerts() {
  useSubscriptionRenewalAlerts(true);
  return null;
}

export function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ConfirmDialogProvider>
        <NotificationsProvider>
          <RealtimeNotifications />
          <SubscriptionRenewalAlerts />
          {children}
        </NotificationsProvider>
      </ConfirmDialogProvider>
    </LocaleProvider>
  );
}
