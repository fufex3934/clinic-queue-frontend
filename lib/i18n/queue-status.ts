import type { MessageKey } from "./catalog/en";
import type { AppointmentStatus, QueueStatus } from "@/types";

export const QUEUE_STATUS_MESSAGE_KEYS: Record<QueueStatus, MessageKey> = {
  waiting: "statusWaiting",
  serving: "statusServing",
  done: "statusDone",
  skipped: "statusSkipped",
};

export const APPOINTMENT_STATUS_MESSAGE_KEYS: Record<
  AppointmentStatus,
  MessageKey
> = {
  scheduled: "apptScheduled",
  confirmed: "apptConfirmed",
  arrived: "apptArrived",
  cancelled: "apptCancelled",
  completed: "apptCompleted",
  no_show: "apptNoShow",
};
