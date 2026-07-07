"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Monitor, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { ErrorAlert } from "@/components/shared/error-alert";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { useQueueLoader } from "@/hooks/use-queue-loader";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { useLocale } from "@/contexts/locale-provider";
import type { MessageKey } from "@/lib/i18n/catalog/en";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { queueService } from "@/services/queueService";
import type { QueueEntry, QueueStatus } from "@/types";
import { CurrentTokenCard } from "./current-token-card";
import {
  CurrentTokenSkeleton,
  QueueListSkeleton,
} from "./queue-loading-skeleton";
import { AddToQueueDialog } from "./add-to-queue-dialog";
import { ServeNextDialog } from "./serve-next-dialog";
import { QueueDraggableWaiting } from "./queue-draggable-waiting";
import { QueueTabPanel } from "./queue-tab-panel";
import { RealtimeQueueStatus } from "./realtime-queue-status";

const TAB_LABEL_KEYS: Record<QueueStatus, MessageKey> = {
  waiting: "tabWaiting",
  serving: "tabServing",
  done: "tabDone",
  skipped: "tabSkipped",
};

const TAB_STATUSES: QueueStatus[] = ["waiting", "serving", "done", "skipped"];

export function QueueManagement() {
  const confirm = useConfirm();
  const { translate } = useLocale();
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

  const { isConnected, isPolling } = useRealtimeQueue(
    operationalClinicId,
    refreshQueue,
    isScopeReady,
  );

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
      <RealtimeQueueStatus isConnected={isConnected} isPolling={isPolling} />

      {isPlatformView && !isScopeReady && (
        <p className="text-sm text-muted-foreground">
          {translate("selectClinicPrompt")}
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4 shrink-0" aria-hidden />
          {loading ? (
            translate("updatingQueue")
          ) : (
            <>
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {waitingCount}
              </span>
              <span>
                {translate(
                  waitingCount === 1
                    ? "patientWaitingSuffix"
                    : "patientsWaitingSuffix",
                )}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href="/dashboard/queue/display"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Monitor className="mr-2 size-4" />
            {translate("openTvMode")}
          </Button>
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
              className={cn("mr-2 size-4", loading && "animate-spin")}
            />
            {translate("refresh")}
          </Button>
          <Button
            size="lg"
            className="shadow-elevation-sm"
            onClick={() => setDialogOpen(true)}
            disabled={loading || serving || waitingCount === 0}
          >
            <ArrowRight className="mr-2 size-5" />
            {translate("serveNext")}
          </Button>
        </div>
      </div>

      {error && (
        <ErrorAlert
          title={translate("queueUnavailable")}
          message={error}
          onRetry={() => void loadQueue()}
        />
      )}

      {loading ? (
        <div className="space-y-6">
          <CurrentTokenSkeleton />
          <QueueListSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          <CurrentTokenCard serving={servingEntry} />

          <Card className="shadow-elevation-sm">
            <CardHeader className="border-b border-subtle pb-4">
              <CardTitle className="text-lg">{translate("todaysQueue")}</CardTitle>
              <CardDescription>{translate("todaysQueueDesc")}</CardDescription>
              <div
                className="flex flex-wrap gap-1.5 pt-3"
                role="tablist"
                aria-label={translate("queueSectionsAria")}
              >
                {TAB_STATUSES.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={activeTab === key ? "default" : "outline"}
                    role="tab"
                    aria-selected={activeTab === key}
                    onClick={() => setActiveTab(key)}
                  >
                    {translate(TAB_LABEL_KEYS[key])}
                    <span
                      className={cn(
                        "ml-1.5 rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                        activeTab === key
                          ? "bg-primary-foreground/20"
                          : "bg-muted",
                      )}
                    >
                      {byStatus[key].length}
                    </span>
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
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
        </div>
      )}

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
