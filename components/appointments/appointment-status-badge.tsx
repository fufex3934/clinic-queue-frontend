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

/** Visual journey: scheduled → arrived → (queue) serving → done */
export function AppointmentFlowHint({ status }: { status: AppointmentStatus }) {
  const steps = ["scheduled", "arrived", "queued", "serving", "done"] as const;
  const activeIndex =
    status === "arrived"
      ? 1
      : status === "scheduled" || status === "confirmed"
        ? 0
        : -1;

  if (activeIndex < 0) return null;

  return (
    <p className="text-xs text-muted-foreground">
      Flow:{" "}
      {steps.map((step, i) => (
        <span
          key={step}
          className={i <= activeIndex ? "font-medium text-foreground" : ""}
        >
          {step}
          {i < steps.length - 1 ? " → " : ""}
        </span>
      ))}
    </p>
  );
}
