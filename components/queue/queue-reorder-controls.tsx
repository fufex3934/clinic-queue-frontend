"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueEntry } from "@/types";

interface QueueReorderControlsProps {
  entries: QueueEntry[];
  entryId: string;
  onReorder: (orderedIds: string[]) => Promise<void>;
  disabled?: boolean;
}

export function QueueReorderControls({
  entries,
  entryId,
  onReorder,
  disabled,
}: QueueReorderControlsProps) {
  const waiting = entries.filter((e) => e.status === "waiting");
  const index = waiting.findIndex((e) => e._id === entryId);
  if (index < 0) return null;

  const move = async (direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= waiting.length) return;
    const reordered = [...waiting];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);
    await onReorder(reordered.map((e) => e._id));
  };

  return (
    <div className="flex gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={disabled || index === 0}
        onClick={() => void move(-1)}
        aria-label="Move up"
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={disabled || index === waiting.length - 1}
        onClick={() => void move(1)}
        aria-label="Move down"
      >
        <ArrowDown className="size-3.5" />
      </Button>
    </div>
  );
}
