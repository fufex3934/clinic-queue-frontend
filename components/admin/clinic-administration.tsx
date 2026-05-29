"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Plus, RefreshCw } from "lucide-react";
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
import { getErrorMessage } from "@/lib/errors";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (isPlatformAdmin) {
        const { data } = await clinicService.list();
        setClinics(data);
        const initial =
          data.find((c) => c._id === userClinicId)?._id ?? data[0]?._id ?? "";
        setSelectedId(initial);
        onClinicChange?.(initial);
      } else {
        const { data } = await clinicService.getMine();
        setMyClinic(data);
        setName(data.name);
        setLocation(data.location);
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
  }, [isPlatformAdmin, onClinicChange, userClinicId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSelectClinic = (id: string) => {
    setSelectedId(id);
    onClinicChange?.(id);
    const clinic = clinics.find((c) => c._id === id);
    if (clinic) {
      setEditClinicId(clinic._id);
      setEditName(clinic.name);
      setEditLocation(clinic.location);
    }
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
        workingHoursStart,
        workingHoursEnd,
        maxAppointmentsPerSlot,
      });
      setMyClinic(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update clinic"));
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
      });
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update clinic"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateClinic = async () => {
    if (!editClinicId) return;
    if (!window.confirm("Deactivate this clinic? Staff will not be able to sign in.")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await clinicService.deactivate(editClinicId);
      setEditClinicId(null);
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to deactivate clinic"));
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
      });
      setNewName("");
      setNewLocation("");
      await load();
      handleSelectClinic(data._id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create clinic"));
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
                    <Label htmlFor="clinic-new-location">Location</Label>
                    <Input
                      id="clinic-new-location"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      required
                    />
                  </div>
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
                  Select a clinic to manage its staff below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clinics.length === 0 ? (
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
                        <TableHead />
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
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.location}</TableCell>
                          <TableCell>
                            {c.isActive === false ? "Inactive" : "Active"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                selectedId === c._id ? "default" : "outline"
                              }
                              onClick={() => handleSelectClinic(c._id)}
                            >
                              {selectedId === c._id ? "Selected" : "Manage"}
                            </Button>
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
                  Update tenant details or deactivate the clinic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePlatformUpdate}
                  className="mx-auto max-w-md space-y-4"
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
                    <Label htmlFor="edit-clinic-location">Location</Label>
                    <Input
                      id="edit-clinic-location"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={saving}
                      onClick={() => void handleDeactivateClinic()}
                    >
                      Deactivate clinic
                    </Button>
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
              className="mx-auto max-w-md space-y-4"
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
                <Label htmlFor="clinic-location">Location</Label>
                <Input
                  id="clinic-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
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
