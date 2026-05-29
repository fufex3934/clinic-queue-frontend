import { Badge } from "@/components/ui/badge";
import type { QueueStatus } from "@/types";

const labels: Record<QueueStatus, string> = {
  waiting: "Waiting",
  serving: "Serving",
  done: "Done",
};

const variants: Record<QueueStatus, "default" | "secondary" | "outline"> = {
  waiting: "secondary",
  serving: "default",
  done: "outline",
};

export function QueueStatusBadge({ status }: { status: QueueStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
