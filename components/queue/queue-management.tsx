"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { ErrorAlert } from "@/components/shared/error-alert";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { useQueueLoader } from "@/hooks/use-queue-loader";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { queueService } from "@/services/queueService";
import type { QueueEntry, QueueStatus } from "@/types";
import { CurrentTokenCard } from "./current-token-card";
import {
  CurrentTokenSkeleton,
  QueueTableSkeleton,
} from "./queue-loading-skeleton";
import { AddToQueueDialog } from "./add-to-queue-dialog";
import { ServeNextDialog } from "./serve-next-dialog";
import { QueueDraggableWaiting } from "./queue-draggable-waiting";
import { QueueTabPanel } from "./queue-tab-panel";

const TABS: { key: QueueStatus; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "serving", label: "Serving" },
  { key: "done", label: "Done" },
  { key: "skipped", label: "Skipped" },
];

export function QueueManagement() {
  const confirm = useConfirm();
  const { scope, scopeKey, operationalClinicId, isAdmin, isScopeReady, isPlatformView } =
    useOperationalScope();
  const { entries, loading, error, setError, loadQueue } = useQueueLoader(
    scopeKey,
    scope,
    isScopeReady,
  );
  const [serving, setServing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<QueueStatus>("waiting");

  const refreshQueue = useCallback(() => {
    void loadQueue({ silent: true });
  }, [loadQueue]);

  useRealtimeQueue(operationalClinicId, refreshQueue, isScopeReady);

  const byStatus = useMemo(() => {
    const map: Record<QueueStatus, QueueEntry[]> = {
      waiting: [],
      serving: [],
      done: [],
      skipped: [],
    };
    for (const e of entries) {
      map[e.status]?.push(e);
    }
    for (const key of Object.keys(map) as QueueStatus[]) {
      map[key].sort((a, b) => a.tokenNumber - b.tokenNumber);
    }
    return map;
  }, [entries]);

  const servingEntry = byStatus.serving[0] ?? null;
  const nextWaiting = byStatus.waiting[0] ?? null;
  const waitingCount = byStatus.waiting.length;

  const handleServeNext = async () => {
    setError(null);
    setServing(true);
    try {
      await queueService.serveNext(scope);
      setDialogOpen(false);
      await loadQueue({ silent: true });
      notifySuccess(
        "Now serving",
        nextWaiting
          ? `Token #${nextWaiting.tokenNumber} is being served.`
          : "The next patient in line is being served.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to serve next patient"));
      notifyError(err, "Could not serve next patient");
    } finally {
      setServing(false);
    }
  };

  const runAction = async (
    id: string,
    fn: () => Promise<unknown>,
    success?: { title: string; description?: string },
  ) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await loadQueue({ silent: true });
      if (success) notifySuccess(success.title, success.description);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Queue action failed"));
      notifyError(err, "Queue action failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleSkip = async (id: string) => {
    const ok = await confirm({
      title: "Skip this patient?",
      description:
        "They will move to the skipped list. You can return them to waiting later if needed.",
      confirmLabel: "Skip",
      variant: "destructive",
    });
    if (!ok) return;
    void runAction(id, () => queueService.skip(id, scope), {
      title: "Patient skipped",
      description: "The token was moved to the skipped list.",
    });
  };

  const handleRemove = async (id: string) => {
    const ok = await confirm({
      title: "Remove from queue?",
      description: "This removes the patient from today's queue. This cannot be undone.",
      confirmLabel: "Remove",
      variant: "destructive",
    });
    if (!ok) return;
    void runAction(id, () => queueService.remove(id, scope), {
      title: "Removed from queue",
      description: "The patient was removed from the waiting line.",
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PlatformClinicSelector />

      {isPlatformView && !isScopeReady && (
        <p className="text-sm text-muted-foreground">
          Select a clinic above to load the queue.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Updating queue…"
            : `${waitingCount} patient${waitingCount === 1 ? "" : "s"} waiting`}
        </p>
        <div className="flex flex-wrap gap-2">
          <AddToQueueDialog
            onAdded={() => void loadQueue({ silent: true })}
            disabled={loading || serving}
            scope={scope}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadQueue()}
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
          onRetry={() => void loadQueue()}
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Today&apos;s queue</CardTitle>
                <div className="flex flex-wrap gap-1 pt-2">
                  {TABS.map(({ key, label }) => (
                    <Button
                      key={key}
                      type="button"
                      size="sm"
                      variant={activeTab === key ? "default" : "outline"}
                      onClick={() => setActiveTab(key)}
                    >
                      {label} ({byStatus[key].length})
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {isAdmin && activeTab === "waiting" ? (
                  <QueueDraggableWaiting
                    entries={byStatus.waiting}
                    busyId={busyId}
                    showSkip
                    showRemove
                    showForceServe
                    onReorder={async (orderedIds) => {
                      await queueService.reorder(orderedIds, scope);
                      await loadQueue({ silent: true });
                    }}
                    onSkip={(id) => void handleSkip(id)}
                    onRemove={(id) => void handleRemove(id)}
                    onForceServe={(id) =>
                      void runAction(
                        id,
                        () => queueService.forceServe(id, scope),
                        {
                          title: "Patient called",
                          description: "This token is now being served.",
                        },
                      )
                    }
                  />
                ) : (
                  <QueueTabPanel
                    entries={byStatus[activeTab]}
                    allWaiting={byStatus.waiting}
                    showSkip={activeTab === "waiting"}
                    showRemove={activeTab !== "serving"}
                    showForceServe={isAdmin && activeTab === "waiting"}
                    busyId={busyId}
                    onSkip={(id) => void handleSkip(id)}
                    onRemove={(id) => void handleRemove(id)}
                    onForceServe={(id) =>
                      void runAction(
                        id,
                        () => queueService.forceServe(id, scope),
                        {
                          title: "Patient called",
                          description: "This token is now being served.",
                        },
                      )
                    }
                  />
                )}
              </CardContent>
            </Card>
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
