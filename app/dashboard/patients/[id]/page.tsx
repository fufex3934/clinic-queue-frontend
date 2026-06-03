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
import {
  formatPatientAge,
  formatPatientGender,
} from "@/lib/patient";
import { getErrorMessage } from "@/lib/errors";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

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
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Primary phone</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Secondary phone</p>
              <p className="font-medium">{patient.secondaryPhone ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of birth</p>
              <p className="font-medium">
                {patient.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">
                {formatPatientAge(patient.ageYears, patient.dateOfBirth)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Gender</p>
              <p className="font-medium">
                {formatPatientGender(patient.gender)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last visit</p>
              <p className="font-medium">{formatWhen(patient.lastVisitAt)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Reception notes</p>
              <p className="font-medium whitespace-pre-wrap">
                {patient.notes?.trim() || "—"}
              </p>
            </div>
            {patient.createdAt && (
              <div>
                <p className="text-muted-foreground">Registered</p>
                <p className="font-medium">{formatWhen(patient.createdAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
