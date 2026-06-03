"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, SkipForward, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientName, getPatientPhone } from "@/lib/patient";
import type { QueueEntry } from "@/types";
import { QueueStatusBadge } from "./queue-status-badge";

function SortableRow({
  entry,
  busyId,
  showSkip,
  showForceServe,
  showRemove,
  onSkip,
  onForceServe,
  onRemove,
}: {
  entry: QueueEntry;
  busyId: string | null;
  showSkip?: boolean;
  showForceServe?: boolean;
  showRemove?: boolean;
  onSkip?: (id: string) => void;
  onForceServe?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b">
      <td className="p-2 w-8">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      <td className="p-2 font-mono font-semibold tabular-nums">#{entry.tokenNumber}</td>
      <td className="p-2 font-medium">{getPatientName(entry.patientId)}</td>
      <td className="hidden p-2 sm:table-cell text-muted-foreground">
        {getPatientPhone(entry.patientId)}
      </td>
      <td className="p-2">
        <QueueStatusBadge status={entry.status} />
      </td>
      <td className="p-2 text-right">
        <div className="flex justify-end gap-1">
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
              variant="secondary"
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
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
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
      <p className="py-8 text-center text-sm text-muted-foreground">
        No entries in this section
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="p-2 w-8" />
            <th className="p-2">Token</th>
            <th className="p-2">Patient</th>
            <th className="hidden p-2 sm:table-cell">Phone</th>
            <th className="p-2">Status</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <SortableContext
          items={entries.map((e) => e._id)}
          strategy={verticalListSortingStrategy}
        >
          <tbody>
            {entries.map((entry) => (
              <SortableRow
                key={entry._id}
                entry={entry}
                busyId={busyId}
                showSkip={showSkip}
                showForceServe={showForceServe}
                showRemove={showRemove}
                onSkip={onSkip}
                onForceServe={onForceServe}
                onRemove={onRemove}
              />
            ))}
          </tbody>
        </SortableContext>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">
        Drag rows to reorder the waiting queue
      </p>
    </DndContext>
  );
}
