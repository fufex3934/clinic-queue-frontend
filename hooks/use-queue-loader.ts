"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import { queueEntriesEqual } from "@/lib/queue-entries";
import { queueService } from "@/services/queueService";
import type { QueueEntry } from "@/types";

export function useQueueLoader(
  scopeKey: string,
  scope: { clinicId?: string },
  enabled = true,
) {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const loadQueue = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!enabled) return;
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      try {
        const { data } = await queueService.getToday(scope);
        setEntries((prev) => (queueEntriesEqual(prev, data) ? prev : data));
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load today's queue"));
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    // scopeKey tracks platform clinic changes; scope object is stable per key
    [scope, scopeKey, enabled],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void loadQueue();
  }, [loadQueue, enabled]);

  return { entries, setEntries, loading, error, setError, loadQueue };
}
