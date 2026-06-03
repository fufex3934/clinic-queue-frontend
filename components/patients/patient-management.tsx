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
import {
  PatientProfileFields,
  emptyPatientProfileForm,
  patientProfileFromPatient,
  patientProfilePayload,
} from "@/components/shared/patient-profile-fields";
import { useAuth } from "@/contexts/auth-provider";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useOperationalScope } from "@/hooks/use-operational-scope";
import { formatPatientAge, formatPatientGender } from "@/lib/patient";
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
  const [createProfile, setCreateProfile] = useState(emptyPatientProfileForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editProfile, setEditProfile] = useState(emptyPatientProfileForm);

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
    setEditProfile(patientProfileFromPatient(patient));
  };

  const handleUpdate = async (patientId: string) => {
    setSaving(true);
    setFormError(null);
    try {
      await patientService.update(
        patientId,
        {
          name: editName.trim(),
          phone: editPhone.trim(),
          ...patientProfilePayload(editProfile),
        },
        scope,
      );
      setEditingId(null);
      await reload();
      notifySuccess("Patient updated", "Profile was saved.");
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
        {
          name: name.trim(),
          phone: phone.trim(),
          ...patientProfilePayload(createProfile),
        },
        scope,
      );
      setName("");
      setPhone("");
      setCreateProfile(emptyPatientProfileForm());
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" />
              New patient
            </CardTitle>
            <CardDescription>Name and phone are required</CardDescription>
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
                <Label htmlFor="patient-phone">Primary phone</Label>
                <Input
                  id="patient-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1 555 0100"
                />
              </div>
              <PatientProfileFields
                idPrefix="new"
                profile={createProfile}
                onChange={setCreateProfile}
                disabled={saving}
              />
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
              searchPlaceholder="Search name, phone, notes…"
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p._id}>
                        {editingId === p._id ? (
                          <TableCell colSpan={4} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Name"
                                />
                                <Input
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                  placeholder="Phone"
                                />
                              </div>
                              <PatientProfileFields
                                idPrefix="edit"
                                profile={editProfile}
                                onChange={setEditProfile}
                                disabled={saving}
                              />
                              <div className="flex gap-2">
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
                            </div>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="font-medium">
                              <Link
                                href={`/dashboard/patients/${p._id}`}
                                className="text-primary hover:underline"
                              >
                                {p.name}
                              </Link>
                              {p.notes ? (
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  {p.notes}
                                </p>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              <p>{p.phone}</p>
                              {p.secondaryPhone ? (
                                <p className="text-xs text-muted-foreground">
                                  Alt: {p.secondaryPhone}
                                </p>
                              ) : null}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatPatientAge(p.ageYears, p.dateOfBirth)}
                              {p.gender ? (
                                <span className="block text-xs">
                                  {formatPatientGender(p.gender)}
                                </span>
                              ) : null}
                            </TableCell>
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
              </div>
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
