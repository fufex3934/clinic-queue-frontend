"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { ErrorAlert } from "@/components/shared/error-alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { getErrorMessage } from "@/lib/errors";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { scope, isScopeReady } = useOperationalScope();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isScopeReady) {
      setLoading(false);
      return;
    }
    void patientService
      .getById(id, scope)
      .then(({ data }) => setPatient(data))
      .catch((err: unknown) =>
        setError(getErrorMessage(err, "Failed to load patient")),
      )
      .finally(() => setLoading(false));
  }, [id, scope, isScopeReady]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PlatformClinicSelector />
      <Button variant="ghost" size="sm" render={<Link href="/dashboard/patients" />}>
        <ArrowLeft className="mr-2 size-4" />
        Back to patients
      </Button>

      {error && <ErrorAlert title="Error" message={error} />}
      {loading && (
        <p className="text-sm text-muted-foreground">Loading patient…</p>
      )}
      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>{patient.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Phone:</span> {patient.phone}
            </p>
            {patient.createdAt && (
              <p>
                <span className="text-muted-foreground">Registered:</span>{" "}
                {new Date(patient.createdAt).toLocaleString()}
              </p>
            )}
            <p className="text-xs text-muted-foreground">ID: {patient._id}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
