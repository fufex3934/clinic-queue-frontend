"use client";

import { ArrowRight, UserCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getPatientName } from "@/lib/patient";
import type { QueueEntry } from "@/types";

interface ServeNextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  serving: QueueEntry | null;
  nextWaiting: QueueEntry | null;
  confirming?: boolean;
}

export function ServeNextDialog({
  open,
  onOpenChange,
  onConfirm,
  serving,
  nextWaiting,
  confirming,
}: ServeNextDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <UserCheck className="size-5" />
          </AlertDialogMedia>
          <AlertDialogTitle>Serve next patient?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-left">
            {serving && (
              <>
                Token #{serving.tokenNumber} ({getPatientName(serving.patientId)}) will
                be marked as done.{" "}
              </>
            )}
            {nextWaiting ? (
              <>
                Token #{nextWaiting.tokenNumber} ({getPatientName(nextWaiting.patientId)})
                will move to serving and appear on the display.
              </>
            ) : (
              <span className="text-destructive">
                No patients are waiting. This action cannot proceed.
              </span>
            )}{" "}
            Confirm only when the consultation room is ready.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirming || !nextWaiting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            <ArrowRight className="mr-2 size-4" />
            {confirming ? "Updating…" : "Confirm & serve"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
