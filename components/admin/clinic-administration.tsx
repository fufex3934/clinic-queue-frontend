"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useClinicContext } from "@/contexts/clinic-context";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  ClinicContactFields,
  clinicContactFromClinic,
  clinicContactPayload,
  emptyClinicContactForm,
} from "@/components/shared/clinic-contact-fields";
import { formatClinicAddress, clinicContactSummary } from "@/lib/clinic-display";
import { clinicService } from "@/services/clinicService";
import type { Clinic } from "@/types/clinic";

interface ClinicAdministrationProps {
  isPlatformAdmin: boolean;
  userClinicId: string;
  onClinicChange?: (clinicId: string) => void;
}

export function ClinicAdministration({
  isPlatformAdmin,
  userClinicId,
  onClinicChange,
}: ClinicAdministrationProps) {
  const confirm = useConfirm();
  const { refreshClinics, isPlatformView } = useClinicContext();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [myClinic, setMyClinic] = useState<Clinic | null>(null);
  const [selectedId, setSelectedId] = useState(userClinicId);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("17:00");
  const [maxAppointmentsPerSlot, setMaxAppointmentsPerSlot] = useState(5);
  const [editClinicId, setEditClinicId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newContact, setNewContact] = useState(emptyClinicContactForm);
  const [editContact, setEditContact] = useState(emptyClinicContactForm);
  const [myContact, setMyContact] = useState(emptyClinicContactForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicSearch, setClinicSearch] = useState("");
  const [clinicPage, setClinicPage] = useState(1);
  const [clinicLimit, setClinicLimit] = useState(10);
  const [clinicSortBy, setClinicSortBy] = useState("name");
  const [clinicSortOrder, setClinicSortOrder] = useState<"asc" | "desc">("asc");
  const [clinicTotal, setClinicTotal] = useState(0);
  const [clinicTotalPages, setClinicTotalPages] = useState(1);
  const debouncedClinicSearch = useDebouncedValue(clinicSearch, 400);

  const syncPlatformClinicList = useCallback(async () => {
    if (isPlatformView) {
      await refreshClinics();
    }
  }, [isPlatformView, refreshClinics]);

  const applyClinicToForm = useCallback((clinic: Clinic) => {
    setSelectedId(clinic._id);
    setEditClinicId(clinic._id);
    setEditName(clinic.name);
    setEditLocation(clinic.location);
    setEditContact(clinicContactFromClinic(clinic));
    setWorkingHoursStart(clinic.workingHoursStart ?? "09:00");
    setWorkingHoursEnd(clinic.workingHoursEnd ?? "17:00");
    setMaxAppointmentsPerSlot(clinic.maxAppointmentsPerSlot ?? 5);
  }, []);

  const loadPlatformClinics = useCallback(async () => {
    const { data } = await clinicService.list({
      page: clinicPage,
      limit: clinicLimit,
      search: debouncedClinicSearch.trim() || undefined,
      sortBy: clinicSortBy,
      sortOrder: clinicSortOrder,
    });
    setClinics(data.items);
    setClinicTotal(data.total);
    setClinicTotalPages(data.totalPages);
    return data.items;
  }, [
    clinicPage,
    clinicLimit,
    debouncedClinicSearch,
    clinicSortBy,
    clinicSortOrder,
  ]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (isPlatformAdmin) {
        const items = await loadPlatformClinics();
        const initialClinic =
          items.find((c) => c._id === (selectedId || userClinicId)) ??
          items[0];
        if (initialClinic) {
          applyClinicToForm(initialClinic);
          onClinicChange?.(initialClinic._id);
        }
      } else {
        const { data } = await clinicService.getMine();
        setMyClinic(data);
        setName(data.name);
        setLocation(data.location);
        setMyContact(clinicContactFromClinic(data));
        setWorkingHoursStart(data.workingHoursStart ?? "09:00");
        setWorkingHoursEnd(data.workingHoursEnd ?? "17:00");
        setMaxAppointmentsPerSlot(data.maxAppointmentsPerSlot ?? 5);
        setSelectedId(data._id);
        onClinicChange?.(data._id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load clinic data"));
    } finally {
      setLoading(false);
    }
  }, [
    isPlatformAdmin,
    onClinicChange,
    userClinicId,
    loadPlatformClinics,
    selectedId,
    applyClinicToForm,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    setClinicPage(1);
  }, [debouncedClinicSearch, clinicSortBy, clinicSortOrder, clinicLimit, isPlatformAdmin]);

  useEffect(() => {
    if (!isPlatformAdmin) return;
    void loadPlatformClinics().catch((err: unknown) => {
      setError(getErrorMessage(err, "Failed to load clinics"));
    });
  }, [isPlatformAdmin, loadPlatformClinics]);

  const handleSelectClinic = (id: string) => {
    const clinic = clinics.find((c) => c._id === id);
    if (!clinic) return;
    applyClinicToForm(clinic);
    onClinicChange?.(id);
  };

  const handleUpdateMine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myClinic) return;
    setSaving(true);
    setError(null);
    try {
      const { data } = await clinicService.update(myClinic._id, {
        name: name.trim(),
        location: location.trim(),
        ...clinicContactPayload(myContact),
        workingHoursStart,
        workingHoursEnd,
        maxAppointmentsPerSlot,
      });
      setMyClinic(data);
      notifySuccess("Clinic settings saved", "Your clinic profile was updated.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update clinic"));
      notifyError(err, "Could not save clinic settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClinicId) return;
    setSaving(true);
    setError(null);
    try {
      await clinicService.update(editClinicId, {
        name: editName.trim(),
        location: editLocation.trim(),
        ...clinicContactPayload(editContact),
        workingHoursStart,
        workingHoursEnd,
        maxAppointmentsPerSlot,
      });
      await load();
      await syncPlatformClinicList();
      notifySuccess("Clinic updated", "Tenant settings were saved.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update clinic"));
      notifyError(err, "Could not update clinic");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateClinic = async (clinicId?: string) => {
    const targetId = clinicId ?? editClinicId;
    if (!targetId) return;
    const clinicName =
      clinics.find((c) => c._id === targetId)?.name ?? "this clinic";
    const ok = await confirm({
      title: "Deactivate clinic?",
      description: `${clinicName} will be suspended. Staff will not be able to sign in until you reactivate the clinic.`,
      confirmLabel: "Deactivate",
      cancelLabel: "Keep active",
      variant: "destructive",
    });
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      await clinicService.deactivate(targetId);
      await load();
      await syncPlatformClinicList();
      handleSelectClinic(targetId);
      notifySuccess(
        "Clinic deactivated",
        `${clinicName} is suspended until you activate it again.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to deactivate clinic"));
      notifyError(err, "Could not deactivate clinic");
    } finally {
      setSaving(false);
    }
  };

  const handleActivateClinic = async (clinicId?: string) => {
    const targetId = clinicId ?? editClinicId;
    if (!targetId) return;
    setSaving(true);
    setError(null);
    try {
      await clinicService.update(targetId, { isActive: true });
      await load();
      await syncPlatformClinicList();
      handleSelectClinic(targetId);
      notifySuccess(
        "Clinic activated",
        `${clinics.find((c) => c._id === targetId)?.name ?? "Clinic"} staff can sign in again.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to activate clinic"));
      notifyError(err, "Could not activate clinic");
    } finally {
      setSaving(false);
    }
  };

  const selectedClinic = clinics.find((c) => c._id === editClinicId);
  const selectedClinicInactive = selectedClinic?.isActive === false;

  const handleDeleteClinicPermanent = async (clinic: Clinic) => {
    if (clinic.isActive !== false) {
      notifyError(
        null,
        "Deactivate first",
        "Deactivate the clinic before permanently deleting it.",
      );
      return;
    }
    const ok = await confirm({
      title: "Delete clinic permanently?",
      description: `${clinic.name} and all patients, appointments, queue history, staff accounts, and billing data for this tenant will be removed. This cannot be undone.`,
      confirmLabel: "Delete permanently",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      await clinicService.deletePermanent(clinic._id);
      const items = await loadPlatformClinics();
      await syncPlatformClinicList();
      if (editClinicId === clinic._id) {
        setEditClinicId(null);
        const next = items[0];
        if (next) {
          applyClinicToForm(next);
          onClinicChange?.(next._id);
        } else {
          setSelectedId("");
          onClinicChange?.("");
        }
      }
      notifySuccess(
        "Clinic deleted",
        `${clinic.name} and its tenant data were permanently removed.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to delete clinic"));
      notifyError(err, "Could not delete clinic");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await clinicService.create({
        name: newName.trim(),
        location: newLocation.trim(),
        ...clinicContactPayload(newContact),
      });
      setNewName("");
      setNewLocation("");
      setNewContact(emptyClinicContactForm());
      await load();
      await syncPlatformClinicList();
      handleSelectClinic(data._id);
      notifySuccess(
        "Clinic created",
        `${data.name} was added. You can assign a clinic admin from Staff.`,
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create clinic"));
      notifyError(err, "Could not create clinic");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading clinic settings…</p>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert title="Error" message={error} onRetry={load} />}

      {isPlatformAdmin ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Platform-wide clinic tenants
            </p>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="size-4" />
                  New clinic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateClinic} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinic-new-name">Name</Label>
                    <Input
                      id="clinic-new-name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinic-new-location">Location label</Label>
                    <Input
                      id="clinic-new-location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      required
                      placeholder="e.g. Downtown branch"
                    />
                  </div>
                  <ClinicContactFields
                    idPrefix="new-clinic"
                    contact={newContact}
                    onChange={setNewContact}
                    disabled={saving}
                  />
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? "Creating…" : "Create clinic"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">All clinics</CardTitle>
                <CardDescription>
                  Edit, deactivate, or delete tenants. Use Edit to change settings
                  below.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ListDataToolbar
                  search={clinicSearch}
                  onSearchChange={(v) => {
                    setClinicSearch(v);
                    setClinicPage(1);
                  }}
                  searchPlaceholder="Search clinic name or location…"
                  sortBy={clinicSortBy}
                  sortOptions={[
                    { value: "name", label: "Name" },
                    { value: "location", label: "Location" },
                    { value: "createdAt", label: "Date created" },
                  ]}
                  onSortByChange={(v) => {
                    setClinicSortBy(v);
                    setClinicPage(1);
                  }}
                  sortOrder={clinicSortOrder}
                  onSortOrderChange={(v) => {
                    setClinicSortOrder(v);
                    setClinicPage(1);
                  }}
                  page={clinicPage}
                  totalPages={clinicTotalPages}
                  total={clinicTotal}
                  onPageChange={setClinicPage}
                  limit={clinicLimit}
                  onLimitChange={(n) => {
                    setClinicLimit(n);
                    setClinicPage(1);
                  }}
                />
                {clinics.length === 0 && !loading ? (
                  <EmptyState
                    icon={Building2}
                    title="No clinics"
                    description="Create a clinic to onboard tenants."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinics.map((c) => (
                        <TableRow
                          key={c._id}
                          className={
                            selectedId === c._id ? "bg-muted/50" : undefined
                          }
                        >
                          <TableCell className="font-medium">
                            {c.name}
                            <p className="text-xs font-normal text-muted-foreground">
                              {clinicContactSummary(c)}
                            </p>
                          </TableCell>
                          <TableCell>{formatClinicAddress(c)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                c.isActive === false ? "secondary" : "default"
                              }
                            >
                              {c.isActive === false ? "Inactive" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant={
                                  editClinicId === c._id ? "default" : "outline"
                                }
                                onClick={() => handleSelectClinic(c._id)}
                                aria-label={`Edit ${c.name}`}
                              >
                                <Pencil className="mr-1 size-3.5" />
                                Edit
                              </Button>
                              {c.isActive === false ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={saving}
                                  onClick={() => void handleActivateClinic(c._id)}
                                >
                                  Activate
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={saving}
                                  onClick={() => void handleDeactivateClinic(c._id)}
                                >
                                  Deactivate
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                disabled={saving}
                                onClick={() =>
                                  void handleDeleteClinicPermanent(c)
                                }
                                aria-label={`Delete ${c.name}`}
                              >
                                <Trash2 className="mr-1 size-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {editClinicId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Edit selected clinic</CardTitle>
                <CardDescription>
                  {selectedClinic?.name} — update profile, hours, and slot limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePlatformUpdate}
                  className="mx-auto max-w-lg space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="edit-clinic-name">Name</Label>
                    <Input
                      id="edit-clinic-name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-clinic-location">Location label</Label>
                    <Input
                      id="edit-clinic-location"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      required
                    />
                  </div>
                  <ClinicContactFields
                    idPrefix="edit-clinic"
                    contact={editContact}
                    onChange={setEditContact}
                    disabled={saving}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-hours-start">Opens</Label>
                      <Input
                        id="edit-hours-start"
                        type="time"
                        value={workingHoursStart}
                        onChange={(e) => setWorkingHoursStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-hours-end">Closes</Label>
                      <Input
                        id="edit-hours-end"
                        type="time"
                        value={workingHoursEnd}
                        onChange={(e) => setWorkingHoursEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-slot">Max appointments per slot</Label>
                    <Input
                      id="edit-max-slot"
                      type="number"
                      min={1}
                      max={20}
                      value={maxAppointmentsPerSlot}
                      onChange={(e) =>
                        setMaxAppointmentsPerSlot(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                    {selectedClinicInactive ? (
                      <Button
                        type="button"
                        variant="default"
                        disabled={saving}
                        onClick={() => void handleActivateClinic(editClinicId)}
                      >
                        Activate clinic
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={saving}
                        onClick={() => void handleDeactivateClinic(editClinicId)}
                      >
                        Deactivate clinic
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4" />
              Your clinic
            </CardTitle>
            <CardDescription>
              Clinic profile, working hours, and appointment limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleUpdateMine}
              className="mx-auto max-w-lg space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Name</Label>
                <Input
                  id="clinic-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-location">Location label</Label>
                <Input
                  id="clinic-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <ClinicContactFields
                idPrefix="my-clinic"
                contact={myContact}
                onChange={setMyContact}
                disabled={saving}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="hours-start">Opens</Label>
                  <Input
                    id="hours-start"
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hours-end">Closes</Label>
                  <Input
                    id="hours-end"
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-slot">Max appointments per slot</Label>
                <Input
                  id="max-slot"
                  type="number"
                  min={1}
                  max={20}
                  value={maxAppointmentsPerSlot}
                  onChange={(e) =>
                    setMaxAppointmentsPerSlot(Number(e.target.value))
                  }
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
