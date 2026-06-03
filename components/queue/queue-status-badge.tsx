import { Badge } from "@/components/ui/badge";
import type { QueueStatus } from "@/types";

const labels: Record<QueueStatus, string> = {
  waiting: "In queue",
  serving: "Serving",
  done: "Done",
  skipped: "Skipped",
};

const variants: Record<QueueStatus, "default" | "secondary" | "outline"> = {
  waiting: "secondary",
  serving: "default",
  done: "outline",
  skipped: "outline",
};

export function QueueStatusBadge({ status }: { status: QueueStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
