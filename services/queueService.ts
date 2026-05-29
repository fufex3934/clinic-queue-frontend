import api from "@/lib/api";
import type { CreateQueuePayload, QueueEntry } from "@/types";

type Scope = { clinicId?: string };

export const queueService = {
  getToday(scope?: Scope) {
    return api.get<QueueEntry[]>("/queue/today", { params: scope });
  },

  add(payload: CreateQueuePayload, scope?: Scope) {
    return api.post<QueueEntry>(
      "/queue/add",
      { patientId: payload.patientId },
      { params: scope },
    );
  },

  serveNext(scope?: Scope) {
    return api.patch<QueueEntry>("/queue/serve-next", {}, { params: scope });
  },

  skip(entryId: string, scope?: Scope) {
    return api.patch<QueueEntry>(`/queue/${entryId}/skip`, {}, { params: scope });
  },

  remove(entryId: string, scope?: Scope) {
    return api.delete<{ deleted: boolean; id: string }>(`/queue/${entryId}`, {
      params: scope,
    });
  },

  forceServe(entryId: string, scope?: Scope) {
    return api.patch<QueueEntry>(
      `/queue/${entryId}/serve`,
      {},
      { params: scope },
    );
  },

  reorder(orderedEntryIds: string[], scope?: Scope) {
    return api.patch<QueueEntry[]>(
      "/queue/reorder",
      { orderedEntryIds },
      { params: scope },
    );
  },
};
