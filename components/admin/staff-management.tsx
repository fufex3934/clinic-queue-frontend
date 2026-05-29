"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, UserPlus } from "lucide-react";
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
import { getErrorMessage } from "@/lib/errors";
import {
  CLINIC_STAFF_ROLES,
  PLATFORM_ASSIGNABLE_ROLES,
  ROLE_LABELS,
} from "@/lib/roles";
import { userService } from "@/services/userService";
import type { UserRole } from "@/types/auth";
import type { StaffUser } from "@/types/user";

interface StaffManagementProps {
  clinicId: string;
  isPlatformAdmin: boolean;
  currentUserId: string;
}

export function StaffManagement({
  clinicId,
  isPlatformAdmin,
  currentUserId,
}: StaffManagementProps) {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("receptionist");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const assignableRoles = isPlatformAdmin
    ? PLATFORM_ASSIGNABLE_ROLES
    : CLINIC_STAFF_ROLES;

  const loadStaff = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await userService.list(clinicId);
      setStaff(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load staff"));
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError("Provide an email or phone number for the new account");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await userService.create({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
        role,
        clinicId,
      });
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("receptionist");
      await loadStaff();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to create staff account"));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (memberId: string) => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setUpdatingId(memberId);
    setError(null);
    try {
      await userService.update(memberId, { password: newPassword });
      setResetPasswordId(null);
      setNewPassword("");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reset password"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (member: StaffUser) => {
    setUpdatingId(member.id);
    setError(null);
    try {
      await userService.update(member.id, { isActive: !member.isActive });
      await loadStaff();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update account status"));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (member: StaffUser, newRole: UserRole) => {
    if (member.role === newRole) return;
    setUpdatingId(member.id);
    setError(null);
    try {
      await userService.update(member.id, { role: newRole });
      await loadStaff();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update role"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <ErrorAlert title="Error" message={error} onRetry={loadStaff} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Staff accounts for this clinic
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadStaff}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4" />
              Add staff member
            </CardTitle>
            <CardDescription>
              Creates a login for queue and patient workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full name</Label>
                <Input
                  id="staff-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@clinic.local"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-phone">Phone (if no email)</Label>
                <Input
                  id="staff-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 0100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-password">Temporary password</Label>
                <Input
                  id="staff-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-role">Role</Label>
                <select
                  id="staff-role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Creating…" : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team directory</CardTitle>
            <CardDescription>
              {staff.length} account{staff.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : staff.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No staff yet"
                description="Add receptionists or additional clinic admins."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    const isSelf = member.id === currentUserId;
                    const canEditRole =
                      !isSelf && member.role !== "platform_admin";

                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/admin/users/${member.id}`}
                            className="text-primary hover:underline"
                          >
                            {member.name}
                          </Link>
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (you)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email ?? member.phone ?? "—"}
                        </TableCell>
                        <TableCell>
                          {canEditRole ? (
                            <select
                              className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                              value={member.role}
                              disabled={updatingId === member.id}
                              onChange={(e) =>
                                void handleRoleChange(
                                  member,
                                  e.target.value as UserRole,
                                )
                              }
                            >
                              {assignableRoles.map((r) => (
                                <option key={r} value={r}>
                                  {ROLE_LABELS[r]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Badge variant="secondary">
                              {ROLE_LABELS[member.role]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!isSelf && member.role !== "platform_admin" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant={member.isActive ? "outline" : "default"}
                              disabled={updatingId === member.id}
                              onClick={() => void handleToggleActive(member)}
                            >
                              {member.isActive ? "Disable" : "Enable"}
                            </Button>
                          ) : (
                            <Badge variant="secondary">
                              {member.isActive ? "Active" : "Disabled"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isSelf && member.role !== "platform_admin" ? (
                            resetPasswordId === member.id ? (
                              <div className="flex flex-col items-end gap-2 sm:flex-row">
                                <Input
                                  type="password"
                                  className="h-8 w-36"
                                  placeholder="New password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  minLength={8}
                                />
                                <Button
                                  size="sm"
                                  disabled={updatingId === member.id}
                                  onClick={() => void handleResetPassword(member.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setResetPasswordId(null);
                                    setNewPassword("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setResetPasswordId(member.id)}
                              >
                                Reset password
                              </Button>
                            )
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
