import type { AppointmentStatus, QueueStatus } from "@/types";

/** Semantic status tokens — always use these class names, never hardcoded colors. */
export const QUEUE_STATUS_STYLES: Record<
  QueueStatus,
  { badge: string; dot: string; label: string }
> = {
  waiting: {
    badge: "status-waiting border-transparent",
    dot: "bg-status-waiting",
    label: "Waiting",
  },
  serving: {
    badge: "status-serving border-transparent",
    dot: "bg-status-serving",
    label: "Now serving",
  },
  done: {
    badge: "status-completed border-transparent",
    dot: "bg-status-completed",
    label: "Completed",
  },
  skipped: {
    badge: "status-cancelled border-transparent",
    dot: "bg-status-cancelled",
    label: "Skipped",
  },
};

export const APPOINTMENT_STATUS_STYLES: Record<
  AppointmentStatus,
  { badge: string; label: string }
> = {
  scheduled: {
    badge: "status-waiting border-transparent",
    label: "Scheduled",
  },
  confirmed: {
    badge: "bg-accent text-accent-foreground border-transparent",
    label: "Confirmed",
  },
  arrived: {
    badge: "status-serving border-transparent",
    label: "Arrived",
  },
  cancelled: {
    badge: "status-cancelled border-transparent",
    label: "Cancelled",
  },
  completed: {
    badge: "status-completed border-transparent",
    label: "Completed",
  },
  no_show: {
    badge: "status-cancelled border-transparent",
    label: "No show",
  },
};
