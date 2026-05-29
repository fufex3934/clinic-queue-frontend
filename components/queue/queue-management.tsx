"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getErrorMessage } from "@/lib/errors";
import { queueService } from "@/services/queueService";
import type { QueueEntry } from "@/types";
import { CurrentTokenCard } from "./current-token-card";
import {
  CurrentTokenSkeleton,
  QueueTableSkeleton,
} from "./queue-loading-skeleton";
import { AddToQueueDialog } from "./add-to-queue-dialog";
import { ServeNextDialog } from "./serve-next-dialog";
import { WaitingList } from "./waiting-list";

export function QueueManagement() {
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadQueue = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await queueService.getToday();
      setEntries(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load today's queue"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const servingEntry = entries.find((e) => e.status === "serving") ?? null;
  const nextWaiting =
    entries
      .filter((e) => e.status === "waiting")
      .sort((a, b) => a.tokenNumber - b.tokenNumber)[0] ?? null;

  const waitingCount = entries.filter((e) => e.status === "waiting").length;

  const handleServeNext = async () => {
    setError(null);
    setServing(true);
    try {
      await queueService.serveNext();
      setDialogOpen(false);
      await loadQueue();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to serve next patient"));
    } finally {
      setServing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Updating queue…"
            : `${waitingCount} patient${waitingCount === 1 ? "" : "s"} waiting`}
        </p>
        <div className="flex flex-wrap gap-2">
          <AddToQueueDialog onAdded={loadQueue} disabled={loading || serving} />
          <Button
            variant="outline"
            size="sm"
            onClick={loadQueue}
            disabled={loading || serving}
          >
            <RefreshCw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="lg"
            onClick={() => setDialogOpen(true)}
            disabled={loading || serving || waitingCount === 0}
          >
            <ArrowRight className="mr-2 size-4" />
            Serve Next
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title="Queue unavailable"
          message={error}
          onRetry={loadQueue}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {loading ? (
          <>
            <CurrentTokenSkeleton />
            <QueueTableSkeleton />
          </>
        ) : (
          <>
            <CurrentTokenCard serving={servingEntry} />
            <WaitingList
              entries={entries}
              servingId={servingEntry?._id ?? null}
            />
          </>
        )}
      </div>

      <ServeNextDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleServeNext}
        serving={servingEntry}
        nextWaiting={nextWaiting}
        confirming={serving}
      />
    </div>
  );
}
