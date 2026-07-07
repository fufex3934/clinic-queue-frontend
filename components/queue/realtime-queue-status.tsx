"use client";

import { useEffect, useRef, useState } from "react";
import { Radio, RefreshCw, Wifi } from "lucide-react";
import { QUEUE_POLL_INTERVAL_SEC } from "@/hooks/use-realtime-queue";
import { cn } from "@/lib/utils";

type RealtimeQueueStatusProps = {
  isConnected: boolean;
  isPolling: boolean;
  className?: string;
};

export function RealtimeQueueStatus({
  isConnected,
  isPolling,
  className,
}: RealtimeQueueStatusProps) {
  const [showRestored, setShowRestored] = useState(false);
  const hadDisconnectedRef = useRef(false);

  useEffect(() => {
    if (!isConnected && isPolling) {
      hadDisconnectedRef.current = true;
      setShowRestored(false);
      return;
    }

    if (isConnected && hadDisconnectedRef.current) {
      hadDisconnectedRef.current = false;
      setShowRestored(true);
      const timer = setTimeout(() => setShowRestored(false), 4_000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isPolling]);

  if (showRestored) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100",
          className,
        )}
      >
        <Wifi className="size-4 shrink-0" aria-hidden />
        <span>Live updates restored</span>
      </div>
    );
  }

  if (!isConnected && isPolling) {
    return (
      <div
        role="status"
        className={cn(
          "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100",
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Radio className="size-4 shrink-0 animate-pulse" aria-hidden />
          <span>Reconnecting… Showing latest available data</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 pl-6 text-xs text-amber-900/80 dark:text-amber-100/80">
          <RefreshCw className="size-3 shrink-0" aria-hidden />
          Auto-refreshing every {QUEUE_POLL_INTERVAL_SEC} seconds
        </p>
      </div>
    );
  }

  return null;
}
