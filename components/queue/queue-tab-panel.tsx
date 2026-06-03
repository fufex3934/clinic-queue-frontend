"use client";

import { Trash2, SkipForward, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import type { QueueEntry } from "@/types";
import { QueueReorderControls } from "./queue-reorder-controls";
import { QueueStatusBadge } from "./queue-status-badge";

interface QueueTabPanelProps {
  entries: QueueEntry[];
  allWaiting?: QueueEntry[];
  showSkip?: boolean;
  showRemove?: boolean;
  showForceServe?: boolean;
  showReorder?: boolean;
  busyId: string | null;
  onSkip?: (id: string) => void;
  onRemove?: (id: string) => void;
  onForceServe?: (id: string) => void;
  onReorder?: (orderedIds: string[]) => Promise<void>;
}

export function QueueTabPanel({
  entries,
  showSkip,
  showRemove,
  showForceServe,
  showReorder,
  allWaiting,
  busyId,
  onSkip,
  onRemove,
  onForceServe,
  onReorder,
}: QueueTabPanelProps) {
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No entries in this section
      </p>
    );
  }

  const hasActions =
    showSkip || showRemove || showForceServe || showReorder;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead className="hidden sm:table-cell">Phone</TableHead>
          <TableHead>Status</TableHead>
          {hasActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow
            key={entry._id}
            className={entry.status === "skipped" ? "bg-muted/40" : undefined}
          >
            <TableCell className="font-mono font-semibold tabular-nums">
              #{entry.tokenNumber}
            </TableCell>
            <TableCell className="font-medium">
              {getPatientName(entry.patientId)}
            </TableCell>
            <TableCell className="hidden sm:table-cell text-muted-foreground">
              {getPatientPhone(entry.patientId)}
            </TableCell>
            <TableCell>
              <QueueStatusBadge status={entry.status} />
            </TableCell>
            {hasActions && (
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-1">
                  {showReorder &&
                    entry.status === "waiting" &&
                    onReorder &&
                    allWaiting && (
                      <QueueReorderControls
                        entries={allWaiting}
                        entryId={entry._id}
                        onReorder={onReorder}
                        disabled={busyId === entry._id}
                      />
                    )}
                  {showSkip && entry.status === "waiting" && onSkip && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === entry._id}
                      onClick={() => onSkip(entry._id)}
                    >
                      <SkipForward className="mr-1 size-3" />
                      Skip
                    </Button>
                  )}
                  {showForceServe &&
                    (entry.status === "waiting" || entry.status === "skipped") &&
                    onForceServe && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === entry._id}
                        onClick={() => onForceServe(entry._id)}
                      >
                        <Play className="mr-1 size-3" />
                        Serve
                      </Button>
                    )}
                  {showRemove &&
                    entry.status !== "serving" &&
                    onRemove && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === entry._id}
                        onClick={() => onRemove(entry._id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
