import api from "@/lib/api";
import type { CreateQueuePayload, QueueEntry } from "@/types";

export const queueService = {
  getToday() {
    return api.get<QueueEntry[]>("/queue/today");
  },

  add(payload: CreateQueuePayload) {
    return api.post<QueueEntry>("/queue/add", {
      patientId: payload.patientId,
    });
  },

  serveNext() {
    return api.patch<QueueEntry>("/queue/serve-next");
  },
};
