"use client";

import { useLocale } from "@/contexts/locale-provider";
import { APPOINTMENT_STATUS_MESSAGE_KEYS } from "@/lib/i18n/queue-status";
import { cn } from "@/lib/utils";
import { APPOINTMENT_STATUS_STYLES } from "@/lib/status-theme";
import type { AppointmentStatus } from "@/types";

export function AppointmentStatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const { translate } = useLocale();
  const styles = APPOINTMENT_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles.badge,
        className,
      )}
    >
      {translate(APPOINTMENT_STATUS_MESSAGE_KEYS[status])}
    </span>
  );
}

const lifecycleSteps = [
  "scheduled",
  "confirmed",
  "arrived",
  "in queue",
  "serving",
  "done",
] as const;

const statusStepIndex: Partial<Record<AppointmentStatus, number>> = {
  scheduled: 0,
  confirmed: 1,
  arrived: 2,
  completed: 5,
  cancelled: -1,
  no_show: -1,
};

/** Full appointment lifecycle hint. */
export function AppointmentFlowHint({ status }: { status: AppointmentStatus }) {
  if (status === "cancelled") {
    return (
      <p className="text-xs text-muted-foreground">Cancelled — not in queue</p>
    );
  }
  if (status === "no_show") {
    return (
      <p className="text-xs text-muted-foreground">Marked no-show — not in queue</p>
    );
  }

  const activeIndex = statusStepIndex[status] ?? -1;
  if (activeIndex < 0) return null;

  return (
    <p className="text-xs text-muted-foreground">
      {lifecycleSteps.map((step, i) => (
        <span
          key={step}
          className={i <= activeIndex ? "font-medium text-foreground" : ""}
        >
          {step}
          {i < lifecycleSteps.length - 1 ? " → " : ""}
        </span>
      ))}
    </p>
  );
}
