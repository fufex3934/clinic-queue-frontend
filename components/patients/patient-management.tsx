"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, RefreshCw, Search, UserPlus } from "lucide-react";
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
import { PlatformClinicSelector } from "@/components/admin/platform-clinic-selector";
import { useAuth } from "@/contexts/auth-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { getErrorMessage } from "@/lib/errors";
import { canAccessFeature } from "@/lib/permissions";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";

export function PatientManagement() {
  const { user } = useAuth();
  const { scope, scopeKey, isScopeReady } = useOperationalScope();
  const canUseQueue = canAccessFeature(user?.role, "queue");
  const canBookAppointments = canAccessFeature(user?.role, "appointmentsBook");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const loadPatients = useCallback(async () => {
    if (!isScopeReady) {
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const q = debouncedSearch.trim();
      const { data } = await patientService.list({
        ...scope,
        search: q || undefined,
      });
      setPatients(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load patients"));
    } finally {
      setLoading(false);
    }
  }, [scope, scopeKey, debouncedSearch, isScopeReady]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients, isScopeReady]);

  const startEdit = (patient: Patient) => {
    setEditingId(patient._id);
    setEditName(patient.name);
    setEditPhone(patient.phone);
  };

  const handleUpdate = async (patientId: string) => {
    setSaving(true);
    setError(null);
    try {
      await patientService.update(
        patientId,
        { name: editName.trim(), phone: editPhone.trim() },
        scope,
      );
      setEditingId(null);
      await loadPatients();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update patient"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await patientService.create(
        { name: name.trim(), phone: phone.trim() },
        scope,
      );
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
      <PlatformClinicSelector />

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
              {patients.length} patient{patients.length === 1 ? "" : "s"}
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
            ) : patients.length === 0 ? (
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p._id}>
                      {editingId === p._id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={saving}
                                onClick={() => void handleUpdate(p._id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            <Link
                              href={`/dashboard/patients/${p._id}`}
                              className="text-primary hover:underline"
                            >
                              {p.name}
                            </Link>
                          </TableCell>
                          <TableCell>{p.phone}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(p)}
                            >
                              <Pencil className="mr-1 size-3" />
                              Edit
                            </Button>
                          </TableCell>
                        </>
                      )}
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
