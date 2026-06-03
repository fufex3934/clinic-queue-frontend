"use client";

import { Clock, CheckCircle2, Play, SkipForward } from "lucide-react";
import { useLocale } from "@/contexts/locale-provider";
import { QUEUE_STATUS_MESSAGE_KEYS } from "@/lib/i18n/queue-status";
import { cn } from "@/lib/utils";
import { QUEUE_STATUS_STYLES } from "@/lib/status-theme";
import type { QueueStatus } from "@/types";

const icons: Record<QueueStatus, typeof Clock> = {
  waiting: Clock,
  serving: Play,
  done: CheckCircle2,
  skipped: SkipForward,
};

export function QueueStatusBadge({
  status,
  className,
  size = "default",
}: {
  status: QueueStatus;
  className?: string;
  size?: "default" | "lg";
}) {
  const { translate } = useLocale();
  const styles = QUEUE_STATUS_STYLES[status];
  const Icon = icons[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles.badge,
        size === "lg" && "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3"} aria-hidden />
      {translate(QUEUE_STATUS_MESSAGE_KEYS[status])}
    </span>
  );
}
