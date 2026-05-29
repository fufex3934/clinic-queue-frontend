import { Ticket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import type { QueueEntry } from "@/types";
import { QueueStatusBadge } from "./queue-status-badge";

interface CurrentTokenCardProps {
  serving: QueueEntry | null;
  loading?: boolean;
}

export function CurrentTokenCard({ serving, loading }: CurrentTokenCardProps) {
  const isActive = Boolean(serving) && !loading;

  return (
    <Card
      className={
        isActive
          ? "border-2 border-primary bg-gradient-to-br from-primary/15 via-primary/5 to-background shadow-md ring-2 ring-primary/20"
          : "border-primary/20 bg-gradient-to-br from-primary/5 to-background"
      }
      aria-live="polite"
      aria-busy={loading}
    >
      {isActive && (
        <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Now serving
        </div>
      )}
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2">
          <Ticket className="size-4" />
          Current token
        </CardDescription>
        <CardTitle
          className={`text-5xl font-bold tabular-nums tracking-tight ${isActive ? "text-primary" : ""}`}
        >
          {serving ? `#${serving.tokenNumber}` : "—"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {serving ? (
          <div className="space-y-2">
            <p className="text-lg font-semibold">{getPatientName(serving.patientId)}</p>
            <p className="text-sm text-muted-foreground">
              {getPatientPhone(serving.patientId)}
            </p>
            <QueueStatusBadge status={serving.status} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No patient is being served. Use &quot;Serve Next&quot; when the room is
            ready.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
