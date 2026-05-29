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
import { getErrorMessage } from "@/lib/errors";
import { queueService } from "@/services/queueService";
import type { QueueEntry, QueueStatus } from "@/types";
import { CurrentTokenCard } from "./current-token-card";
import {
  CurrentTokenSkeleton,
  QueueTableSkeleton,
} from "./queue-loading-skeleton";
import { AddToQueueDialog } from "./add-to-queue-dialog";
import { ServeNextDialog } from "./serve-next-dialog";
import { QueueTabPanel } from "./queue-tab-panel";

const TABS: { key: QueueStatus; label: string }[] = [
  { key: "waiting", label: "Waiting" },
  { key: "serving", label: "Serving" },
  { key: "done", label: "Done" },
  { key: "skipped", label: "Skipped" },
];

export function QueueManagement() {
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to serve next patient"));
    } finally {
      setServing(false);
    }
  };

  const runAction = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await fn();
      await loadQueue({ silent: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Queue action failed"));
    } finally {
      setBusyId(null);
    }
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
                <QueueTabPanel
                  entries={byStatus[activeTab]}
                  showSkip={activeTab === "waiting"}
                  showRemove={activeTab !== "serving"}
                  showForceServe={isAdmin && activeTab === "waiting"}
                  busyId={busyId}
                  onSkip={(id) =>
                    void runAction(id, () => queueService.skip(id, scope))
                  }
                  onRemove={(id) =>
                    void runAction(id, () => queueService.remove(id, scope))
                  }
                  onForceServe={(id) =>
                    void runAction(id, () => queueService.forceServe(id, scope))
                  }
                />
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
