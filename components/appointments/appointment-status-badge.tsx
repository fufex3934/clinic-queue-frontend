import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/types";

const labels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  arrived: "Arrived",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const variant =
    status === "cancelled"
      ? "outline"
      : status === "completed"
        ? "secondary"
        : status === "arrived"
          ? "default"
          : "default";

  return <Badge variant={variant}>{labels[status]}</Badge>;
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
