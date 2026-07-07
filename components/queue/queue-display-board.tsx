"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Monitor, X } from "lucide-react";
import { LocaleSelect } from "@/components/shared/locale-select";
import { Button } from "@/components/ui/button";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { ErrorAlert } from "@/components/shared/error-alert";
import { useClinicContext } from "@/contexts/clinic-context";
import { useLocale } from "@/contexts/locale-provider";
import { isEthiopicLocale } from "@/lib/i18n/messages";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { useQueueLoader } from "@/hooks/use-queue-loader";
import { formatEthiopianPhone } from "@/lib/phone";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import { cn } from "@/lib/utils";
import type { QueueEntry } from "@/types";
import { RealtimeQueueStatus } from "./realtime-queue-status";

function DisplayClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      dateTime={now.toISOString()}
      className="text-sm tabular-nums text-muted-foreground md:text-base"
    >
      {now.toLocaleString("en-ET", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Addis_Ababa",
      })}
    </time>
  );
}

export function QueueDisplayBoard() {
  const { translate, locale } = useLocale();
  const { activeClinic } = useClinicContext();
  const { scope, scopeKey, operationalClinicId, isScopeReady, isPlatformView } =
    useOperationalScope();
  const { entries, loading, error, loadQueue } = useQueueLoader(
    scopeKey,
    scope,
    isScopeReady,
  );

  const refreshQueue = useCallback(() => {
    void loadQueue({ silent: true });
  }, [loadQueue]);

  const { isConnected, isPolling } = useRealtimeQueue(
    operationalClinicId,
    refreshQueue,
    isScopeReady,
  );

  const { serving, nextWaiting, waiting } = useMemo(() => {
    const byStatus: Record<string, QueueEntry[]> = {
      waiting: [],
      serving: [],
    };
    for (const e of entries) {
      if (e.status === "waiting" || e.status === "serving") {
        byStatus[e.status]?.push(e);
      }
    }
    byStatus.waiting.sort((a, b) => a.tokenNumber - b.tokenNumber);
    byStatus.serving.sort((a, b) => a.tokenNumber - b.tokenNumber);
    return {
      serving: byStatus.serving[0] ?? null,
      nextWaiting: byStatus.waiting[0] ?? null,
      waiting: byStatus.waiting,
    };
  }, [entries]);

  const clinicName = activeClinic?.name ?? translate("queueDisplay");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-subtle bg-background/80 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Monitor className="size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold md:text-xl">
              {clinicName}
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {translate("clinicWaitingRoom")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DisplayClock />
          <LocaleSelect selectClassName="max-w-[10rem] md:max-w-[11rem]" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            render={<Link href="/dashboard/queue" />}
          >
            <X className="mr-2 size-4" />
            {translate("exitDisplay")}
          </Button>
        </div>
      </header>

      {isPlatformView && (
        <div className="border-b border-subtle px-4 py-3 md:px-8">
          <PlatformClinicSelector />
        </div>
      )}

      <div className="px-4 pt-3 md:px-8">
        <RealtimeQueueStatus isConnected={isConnected} isPolling={isPolling} />
      </div>

      {error && (
        <div className="px-4 py-4 md:px-8">
          <ErrorAlert
            title="Queue unavailable"
            message={error}
            onRetry={() => void loadQueue()}
          />
        </div>
      )}

      <main className="flex flex-1 flex-col gap-6 p-4 md:grid md:grid-cols-[1fr_320px] md:gap-8 md:p-8 lg:grid-cols-[1fr_360px]">
        <section
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-2xl border border-subtle p-6 md:p-10",
            serving ? "gradient-brand shadow-elevation-lg" : "bg-card",
          )}
          aria-live="polite"
        >
          {serving && (
            <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-primary md:text-base">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-3 rounded-full bg-primary" />
              </span>
              {translate("nowServing")}
            </p>
          )}

          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {translate("currentToken")}
          </p>
          <p
            className={cn(
              "mt-2 font-bold tabular-nums leading-none",
              serving
                ? "text-[clamp(5rem,18vw,10rem)] text-primary"
                : "text-[clamp(4rem,14vw,7rem)] text-muted-foreground",
            )}
          >
            {serving ? `#${serving.tokenNumber}` : "—"}
          </p>

          {serving ? (
            <p
              className={cn(
                "mt-6 max-w-xl text-center font-semibold",
                isEthiopicLocale(locale)
                  ? "text-2xl md:text-3xl"
                  : "text-xl md:text-2xl",
              )}
            >
              {getPatientName(serving.patientId)}
            </p>
          ) : (
            <p className="mt-6 text-center text-lg text-muted-foreground md:text-xl">
              {translate("noOneServing")}
            </p>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {translate("upNext")}
            </p>
            {nextWaiting ? (
              <>
                <p className="mt-2 text-4xl font-bold tabular-nums text-primary">
                  #{nextWaiting.tokenNumber}
                </p>
                <p className="mt-1 truncate text-lg font-medium">
                  {getPatientName(nextWaiting.patientId)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-muted-foreground">—</p>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-subtle bg-card">
            <div className="border-b border-subtle px-4 py-3">
              <p className="font-semibold">{translate("waiting")}</p>
              <p className="text-sm text-muted-foreground">
                {waiting.length} {translate("patientsWaiting")}
              </p>
            </div>
            <ul className="max-h-[40vh] flex-1 overflow-y-auto p-2 md:max-h-none">
              {loading && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  …
                </li>
              )}
              {!loading && waiting.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  —
                </li>
              )}
              {waiting.slice(0, 12).map((e) => (
                <li
                  key={e._id}
                  className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 odd:bg-muted/40"
                >
                  <span className="text-xl font-bold tabular-nums text-primary">
                    #{e.tokenNumber}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium">
                    {getPatientName(e.patientId)}
                  </span>
                </li>
              ))}
              {waiting.length > 12 && (
                <li className="px-3 py-2 text-center text-xs text-muted-foreground">
                  +{waiting.length - 12} more
                </li>
              )}
            </ul>
          </div>
        </aside>
      </main>

      {serving && (
        <footer className="sr-only">
          {getPatientPhone(serving.patientId) &&
            formatEthiopianPhone(getPatientPhone(serving.patientId)!)}
        </footer>
      )}
    </div>
  );
}
