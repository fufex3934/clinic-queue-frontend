import type { PatientRef } from "./patient";

export type QueueStatus = "waiting" | "serving" | "done" | "skipped";

export interface QueueEntry {
  _id: string;
  patientId: PatientRef;
  tokenNumber: number;
  status: QueueStatus;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQueuePayload {
  patientId: string;
  date?: string;
}

export interface UpdateQueuePayload {
  status?: QueueStatus;
}
