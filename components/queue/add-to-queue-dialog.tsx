"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PatientPicker } from "@/components/shared/patient-picker";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { patientService } from "@/services/patientService";
import { queueService } from "@/services/queueService";
import type { Patient } from "@/types";

interface AddToQueueDialogProps {
  onAdded: () => void;
  disabled?: boolean;
  scope?: { clinicId?: string };
}

export function AddToQueueDialog({
  onAdded,
  disabled,
  scope,
}: AddToQueueDialogProps) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void patientService
      .list({ ...scope, limit: 50, sortBy: "name", sortOrder: "asc" })
      .then(({ data }) => setPatients(data.items));
  }, [open, scope]);

  const handleAdd = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      await queueService.add({ patientId }, scope);
      setOpen(false);
      setPatientId("");
      onAdded();
      notifySuccess(
        "Added to queue",
        "The patient received a token and appears in the waiting list.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to add to queue"));
      notifyError(err, "Could not add patient to queue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="default" size="sm" disabled={disabled} />
        }
      >
        <UserPlus className="mr-2 size-4" />
        Add to queue
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add patient to today&apos;s queue</SheetTitle>
          <SheetDescription>
            Assigns the next available token for your clinic today.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 px-4">
          <PatientPicker
            patients={patients}
            value={patientId}
            onChange={setPatientId}
            disabled={loading}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={!patientId || loading}
          >
            {loading ? "Adding…" : "Add to queue"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
