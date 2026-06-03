import { Ticket, User } from "lucide-react";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import { cn } from "@/lib/utils";
import type { QueueEntry } from "@/types";
import { QueueStatusBadge } from "./queue-status-badge";

interface CurrentTokenCardProps {
  serving: QueueEntry | null;
  loading?: boolean;
}

export function CurrentTokenCard({ serving, loading }: CurrentTokenCardProps) {
  const isActive = Boolean(serving) && !loading;

  return (
    <section
      className={cn(
        "surface-elevated overflow-hidden transition-shadow duration-200",
        isActive && "ring-2 ring-primary shadow-elevation-lg",
      )}
      aria-live="polite"
      aria-busy={loading}
      aria-label="Now serving"
    >
      {isActive && (
        <div className="flex items-center justify-center gap-2 border-b border-subtle bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
          </span>
          Now serving
        </div>
      )}

      <div
        className={cn(
          "grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8",
          isActive ? "gradient-brand" : "bg-card",
        )}
      >
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            <Ticket className="size-4" aria-hidden />
            Current token
          </p>
          <p
            className={cn(
              "font-bold tabular-nums leading-none tracking-tight",
              isActive
                ? "text-[clamp(4.5rem,12vw,7.5rem)] text-primary"
                : "text-[clamp(3rem,8vw,5rem)] text-muted-foreground",
            )}
          >
            {serving ? `#${serving.tokenNumber}` : "—"}
          </p>
        </div>

        <div className="min-w-0 md:max-w-sm md:text-right">
          {serving ? (
            <div className="space-y-3 md:items-end md:flex md:flex-col">
              <div className="flex items-start gap-3 md:flex-row-reverse md:text-right">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <User className="size-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold md:text-2xl">
                    {getPatientName(serving.patientId)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPatientPhone(serving.patientId)}
                  </p>
                </div>
              </div>
              <QueueStatusBadge status={serving.status} size="lg" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground md:text-base">
              No patient is being served. Press{" "}
              <span className="font-semibold text-foreground">Serve Next</span> when
              the room is ready.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
