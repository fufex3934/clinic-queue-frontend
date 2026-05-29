"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "@/components/shared/error-alert";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuth } from "@/contexts/auth-provider";
import { getErrorMessage } from "@/lib/errors";
import { canAccessFeature } from "@/lib/permissions";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";

export function PatientManagement() {
  const { user } = useAuth();
  const canUseQueue = canAccessFeature(user?.role, "queue");
  const canBookAppointments = canAccessFeature(user?.role, "appointmentsBook");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const loadPatients = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await patientService.list();
      setPatients(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load patients"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
    );
  }, [patients, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await patientService.create({ name: name.trim(), phone: phone.trim() });
      setName("");
      setPhone("");
      await loadPatients();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create patient"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Register walk-in patients for your clinic
        </p>
        <Button variant="outline" size="sm" onClick={loadPatients} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <ErrorAlert title="Error" message={error} onRetry={loadPatients} />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" />
              New patient
            </CardTitle>
            <CardDescription>Add to your clinic registry</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Full name</Label>
                <Input
                  id="patient-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Phone</Label>
                <Input
                  id="patient-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 555 0100"
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving…" : "Create patient"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patient directory</CardTitle>
            <CardDescription>
              {filtered.length} patient{filtered.length === 1 ? "" : "s"}
            </CardDescription>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No patients yet"
                description="Create your first patient to use queue and appointments."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {(canUseQueue || canBookAppointments) && (
        <p className="text-center text-sm text-muted-foreground">
          Use patients in{" "}
          {canUseQueue && (
            <>
              <Link href="/dashboard/queue" className="text-primary underline">
                Queue
              </Link>
              {canBookAppointments && " or "}
            </>
          )}
          {canBookAppointments && (
            <Link
              href="/dashboard/appointments/book"
              className="text-primary underline"
            >
              Appointments
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
