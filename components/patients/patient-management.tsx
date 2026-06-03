"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, RefreshCw, UserPlus } from "lucide-react";
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
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { useAuth } from "@/contexts/auth-provider";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { canAccessFeature } from "@/lib/permissions";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types";
import type { ListQueryParams } from "@/types/pagination";

export function PatientManagement() {
  const { user } = useAuth();
  const { scope, scopeKey, isScopeReady } = useOperationalScope();
  const canUseQueue = canAccessFeature(user?.role, "queue");
  const canBookAppointments = canAccessFeature(user?.role, "appointmentsBook");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const fetchPatients = useCallback(
    (params: ListQueryParams) =>
      patientService.list({ ...scope, ...params }),
    [scope, scopeKey],
  );

  const {
    items: patients,
    total,
    page,
    limit,
    totalPages,
    search,
    sortBy,
    sortOrder,
    loading,
    error,
    setSearch,
    setSortBy,
    setSortOrder,
    setPage,
    setLimit,
    reload,
  } = usePaginatedList<Patient>({
    fetcher: fetchPatients,
    enabled: isScopeReady,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    resetDeps: [scopeKey],
  });

  const startEdit = (patient: Patient) => {
    setEditingId(patient._id);
    setEditName(patient.name);
    setEditPhone(patient.phone);
  };

  const handleUpdate = async (patientId: string) => {
    setSaving(true);
    setFormError(null);
    try {
      await patientService.update(
        patientId,
        { name: editName.trim(), phone: editPhone.trim() },
        scope,
      );
      setEditingId(null);
      await reload();
      notifySuccess("Patient updated", "Contact details were saved.");
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to update patient"));
      notifyError(err, "Could not update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await patientService.create(
        { name: name.trim(), phone: phone.trim() },
        scope,
      );
      setName("");
      setPhone("");
      await reload();
      notifySuccess(
        "Patient registered",
        `${name.trim()} was added to your clinic records.`,
      );
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create patient"));
      notifyError(err, "Could not register patient");
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
        <Button variant="outline" size="sm" onClick={() => void reload()} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {(error || formError) && (
        <ErrorAlert
          title="Error"
          message={error ?? formError ?? ""}
          onRetry={() => void reload()}
        />
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
              {total} patient{total === 1 ? "" : "s"} in your clinic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListDataToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by name or phone…"
              sortBy={sortBy}
              sortOptions={[
                { value: "createdAt", label: "Date added" },
                { value: "name", label: "Name" },
                { value: "phone", label: "Phone" },
              ]}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
            />
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
