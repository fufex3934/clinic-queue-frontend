"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { getStoredAccessToken } from "@/lib/auth/token-storage";
import { teardownRealtimeSocket } from "@/lib/realtime-socket";
import { useNotifications } from "@/contexts/notifications-provider";
import { notifyInfo, notifySuccess, notifyWarning } from "@/lib/toast";
import { useAuth } from "@/contexts/auth-provider";
import type { PushNotificationInput } from "@/types/notification";
import type { UserRole } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type PaymentUpdatedPayload = {
  action:
    | "submitted"
    | "proof_uploaded"
    | "approved"
    | "rejected";
  clinicId: string;
  clinicName?: string;
  plan?: string;
  amount?: number;
};

function isPlatformRole(role: UserRole | undefined) {
  return role === "platform_admin";
}

function notifyInbox(
  push: (input: PushNotificationInput) => void,
  input: PushNotificationInput,
) {
  push(input);
  if (input.kind === "success") {
    notifySuccess(input.title, input.description);
  } else if (input.kind === "warning") {
    notifyWarning(input.title, input.description);
  } else {
    notifyInfo(input.title, input.description);
  }
}

export function useRealtimeNotifications(enabled = true): void {
  const { user } = useAuth();
  const { push: pushNotification } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const pushRef = useRef(pushNotification);
  pushRef.current = pushNotification;

  useEffect(() => {
    if (!enabled || !user) return;

    const token = getStoredAccessToken();
    if (!token) return;

    const platform = isPlatformRole(user.role);

    const socket: Socket = io(`${API_URL}/realtime`, {
      auth: { token },
      query: platform ? {} : { clinicId: user.clinicId },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
    });

    const onPaymentUpdated = (payload: PaymentUpdatedPayload) => {
      const name = payload.clinicName ?? "A clinic";
      const plan = payload.plan ? ` (${payload.plan})` : "";
      const amount =
        payload.amount != null ? ` — $${payload.amount}` : "";
      const push = pushRef.current;

      if (platform) {
        switch (payload.action) {
          case "submitted":
            notifyInbox(push, {
              title: "New payment request",
              description: `${name} submitted a subscription payment${plan}${amount}. Review it under Payments.`,
              kind: "info",
              href: "/dashboard/admin/payments",
            });
            break;
          case "proof_uploaded":
            notifyInbox(push, {
              title: "Payment receipt uploaded",
              description: `${name} uploaded proof${plan}${amount}. You can approve it in Payments.`,
              kind: "info",
              href: "/dashboard/admin/payments",
            });
            break;
          case "approved":
            notifyInbox(push, {
              title: "Payment approved",
              description: `${name}'s subscription payment${plan} was approved.`,
              kind: "success",
              href: "/dashboard/admin/payments",
            });
            break;
          case "rejected":
            notifyInbox(push, {
              title: "Payment rejected",
              description: `${name}'s payment request${plan} was rejected.`,
              kind: "warning",
              href: "/dashboard/admin/payments",
            });
            break;
        }
        return;
      }

      switch (payload.action) {
        case "submitted":
          notifyInbox(push, {
            title: "Payment request submitted",
            description: `Your subscription request${plan}${amount} is pending platform review.`,
            kind: "info",
            href: "/dashboard/billing",
          });
          break;
        case "proof_uploaded":
          notifyInbox(push, {
            title: "Receipt uploaded",
            description: `Your payment proof${plan} was sent. You will be notified when it is approved.`,
            kind: "info",
            href: "/dashboard/billing",
          });
          break;
        case "approved": {
          const title = "Subscription activated";
          const description = `Your ${payload.plan ?? "plan"} payment was approved. Your clinic can use the system for another 30 days.`;
          notifyInbox(push, {
            title,
            description,
            kind: "success",
            href: "/dashboard/billing",
          });
          if (!pathnameRef.current.startsWith("/dashboard/billing")) {
            router.refresh();
          }
          break;
        }
        case "rejected":
          notifyInbox(push, {
            title: "Payment not approved",
            description:
              "Your payment request was rejected. Open Billing to submit a new request or contact support.",
            kind: "warning",
            href: "/dashboard/billing",
          });
          break;
      }
    };

    const onQueueActivity = () => {
      if (platform) return;
      if (pathnameRef.current.startsWith("/dashboard/queue")) return;
      notifyInbox(pushRef.current, {
        title: "Queue updated",
        description:
          "The waiting line changed. Open Queue to see the latest tokens.",
        kind: "info",
        href: "/dashboard/queue",
      });
    };

    const onAppointmentUpdated = () => {
      if (platform) return;
      if (pathnameRef.current.startsWith("/dashboard/appointments")) return;
      notifyInbox(pushRef.current, {
        title: "Appointments updated",
        description:
          "Today's schedule changed. Open Appointments to see the latest bookings.",
        kind: "info",
        href: "/dashboard/appointments",
      });
    };

    socket.on("payment.updated", onPaymentUpdated);
    socket.on("queue.updated", onQueueActivity);
    socket.on("queue.added", onQueueActivity);
    socket.on("queue.served", onQueueActivity);
    socket.on("appointment.updated", onAppointmentUpdated);

    return () => {
      teardownRealtimeSocket(socket);
    };
  }, [enabled, user, router]);
}
