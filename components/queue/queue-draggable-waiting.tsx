"use client";

import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { GripVertical, SkipForward, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import { cn } from "@/lib/utils";
import type { QueueEntry } from "@/types";
import { QueueStatusBadge } from "./queue-status-badge";

function WaitingCard({
  entry,
  busyId,
  showSkip,
  showForceServe,
  showRemove,
  onSkip,
  onForceServe,
  onRemove,
  dragHandleProps,
  isDragging,
  isOverlay,
}: {
  entry: QueueEntry;
  busyId: string | null;
  showSkip?: boolean;
  showForceServe?: boolean;
  showRemove?: boolean;
  onSkip?: (id: string) => void;
  onForceServe?: (id: string) => void;
  onRemove?: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isOverlay?: boolean;
}) {
  const isNext = entry.status === "waiting";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all sm:flex-row sm:items-center",
        isDragging && "opacity-50",
        isOverlay && "shadow-elevation-lg ring-2 ring-primary",
        isNext && !isOverlay && "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-subtle bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label={`Drag to reorder token ${entry.tokenNumber}`}
          {...dragHandleProps}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-status-waiting font-bold tabular-nums text-status-waiting-foreground text-xl">
          #{entry.tokenNumber}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">
            {getPatientName(entry.patientId)}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {getPatientPhone(entry.patientId)}
          </p>
        </div>
        <QueueStatusBadge status={entry.status} className="hidden sm:inline-flex" />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-subtle pt-3 sm:border-0 sm:pt-0">
        <QueueStatusBadge status={entry.status} className="sm:hidden" />
        {showSkip && onSkip && (
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
        {showForceServe && onForceServe && (
          <Button
            size="sm"
            disabled={busyId === entry._id}
            onClick={() => onForceServe(entry._id)}
          >
            <Play className="mr-1 size-3" />
            Serve
          </Button>
        )}
        {showRemove && onRemove && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busyId === entry._id}
            onClick={() => onRemove(entry._id)}
            aria-label="Remove from queue"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SortableWaitingCard(
  props: Omit<
    React.ComponentProps<typeof WaitingCard>,
    "dragHandleProps" | "isDragging" | "isOverlay"
  > & { entry: QueueEntry },
) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.entry._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <WaitingCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface QueueDraggableWaitingProps {
  entries: QueueEntry[];
  busyId: string | null;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onSkip?: (id: string) => void;
  onForceServe?: (id: string) => void;
  onRemove?: (id: string) => void;
  showSkip?: boolean;
  showForceServe?: boolean;
  showRemove?: boolean;
}

export function QueueDraggableWaiting({
  entries,
  busyId,
  onReorder,
  onSkip,
  onForceServe,
  onRemove,
  showSkip,
  showForceServe,
  showRemove,
}: QueueDraggableWaitingProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e._id === active.id);
    const newIndex = entries.findIndex((e) => e._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(entries, oldIndex, newIndex);
    await onReorder(reordered.map((e) => e._id));
  };

  if (entries.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No patients waiting — add walk-ins or serve the next token.
      </p>
    );
  }

  const activeEntry = entries.find((e) => e._id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={(e) => void handleDragEnd(e)}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext
        items={entries.map((e) => e._id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-3" role="list" aria-label="Waiting queue">
          {entries.map((entry, index) => (
            <li key={entry._id}>
              <SortableWaitingCard
                entry={entry}
                busyId={busyId}
                showSkip={showSkip}
                showForceServe={showForceServe}
                showRemove={showRemove}
                onSkip={onSkip}
                onForceServe={onForceServe}
                onRemove={onRemove}
              />
              {index === 0 && (
                <p className="mt-1 px-1 text-xs font-medium text-primary">
                  Next in line
                </p>
              )}
            </li>
          ))}
        </ul>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeEntry ? (
          <WaitingCard
            entry={activeEntry}
            busyId={busyId}
            isOverlay
            showSkip={showSkip}
            showForceServe={showForceServe}
            showRemove={showRemove}
          />
        ) : null}
      </DragOverlay>
      <p className="mt-4 text-xs text-muted-foreground">
        Drag cards to reorder the waiting line. Changes save automatically.
      </p>
    </DndContext>
  );
}
