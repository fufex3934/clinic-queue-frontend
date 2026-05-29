import { ListOrdered, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import type { QueueEntry } from "@/types";
import { QueueStatusBadge } from "./queue-status-badge";

interface WaitingListProps {
  entries: QueueEntry[];
  servingId?: string | null;
}

export function WaitingList({ entries, servingId }: WaitingListProps) {
  const waiting = entries.filter((e) => e.status === "waiting");
  const doneCount = entries.filter((e) => e.status === "done").length;

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s queue</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Users}
            title="Queue is empty"
            description="No walk-ins today yet. Patients will appear here after they are added to the queue from reception."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ListOrdered className="size-4" />
          Today&apos;s queue
        </CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground">{waiting.length}</span> waiting
          · <span className="font-medium text-foreground">{doneCount}</span> completed
          {servingId ? " · 1 now serving" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Token</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const isServing = entry._id === servingId || entry.status === "serving";
              const isNext =
                !isServing &&
                entry.status === "waiting" &&
                waiting[0]?._id === entry._id;

              return (
                <TableRow
                  key={entry._id}
                  className={
                    isServing
                      ? "border-l-4 border-l-primary bg-primary/10 font-medium shadow-sm"
                      : isNext
                        ? "bg-muted/50"
                        : entry.status === "done"
                          ? "text-muted-foreground opacity-70"
                          : undefined
                  }
                  aria-current={isServing ? "true" : undefined}
                >
                  <TableCell className="tabular-nums">
                    <span className={isServing ? "text-lg font-bold text-primary" : "font-semibold"}>
                      #{entry.tokenNumber}
                    </span>
                    {isNext && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (next)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getPatientName(entry.patientId)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getPatientPhone(entry.patientId)}
                  </TableCell>
                  <TableCell>
                    <QueueStatusBadge status={entry.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
