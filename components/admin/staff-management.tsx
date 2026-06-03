"use client";

import { useCallback, useEffect, useState } from "react";
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
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess, notifyValidation } from "@/lib/toast";
import {
  CLINIC_MANAGED_STAFF_ROLES,
  PLATFORM_CLINIC_ACCOUNT_ROLES,
  ROLE_LABELS,
} from "@/lib/roles";
import { userService } from "@/services/userService";
import type { ListQueryParams } from "@/types/pagination";
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
  const confirm = useConfirm();
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(
    isPlatformAdmin ? "admin" : "receptionist",
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const assignableRoles = isPlatformAdmin
    ? PLATFORM_CLINIC_ACCOUNT_ROLES
    : CLINIC_MANAGED_STAFF_ROLES;

  const canManageMember = (member: StaffUser) => {
    if (member.role === "platform_admin") return false;
    if (isPlatformAdmin) return true;
    return member.role === "receptionist";
  };

  const fetchStaff = useCallback(
    (params: ListQueryParams) => userService.list({ clinicId, ...params }),
    [clinicId],
  );

  const {
    items: staff,
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
    reload: loadStaff,
  } = usePaginatedList<StaffUser>({
    fetcher: fetchStaff,
    enabled: Boolean(clinicId),
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultLimit: 15,
    resetDeps: [clinicId],
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      notifyValidation("Provide an email or phone number for the new account.");
      return;
    }
    setSaving(true);
    setFormError(null);
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
      setRole(isPlatformAdmin ? "admin" : "receptionist");
      await loadStaff();
      notifySuccess(
        "Staff account created",
        `${name.trim() || "New user"} can sign in with the credentials you set.`,
      );
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create staff account"));
      notifyError(err, "Could not create staff account");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (memberId: string) => {
    if (newPassword.length < 8) {
      notifyValidation("Password must be at least 8 characters.");
      return;
    }
    setUpdatingId(memberId);
    setFormError(null);
    try {
      await userService.update(memberId, { password: newPassword });
      setResetPasswordId(null);
      setNewPassword("");
      notifySuccess("Password reset", "The staff member can sign in with the new password.");
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to reset password"));
      notifyError(err, "Could not reset password");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (member: StaffUser) => {
    if (member.isActive) {
      const ok = await confirm({
        title: "Deactivate staff account?",
        description: `${member.name} will not be able to sign in until you re-enable the account.`,
        confirmLabel: "Deactivate",
        cancelLabel: "Cancel",
        variant: "destructive",
      });
      if (!ok) return;
    }
    setUpdatingId(member.id);
    setFormError(null);
    try {
      await userService.update(member.id, { isActive: !member.isActive });
      await loadStaff();
      notifySuccess(
        member.isActive ? "Account deactivated" : "Account activated",
        member.isActive
          ? `${member.name} can no longer sign in.`
          : `${member.name} can sign in again.`,
      );
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to update account status"));
      notifyError(err, "Could not update account status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (member: StaffUser, newRole: UserRole) => {
    if (member.role === newRole) return;
    setUpdatingId(member.id);
    setFormError(null);
    try {
      await userService.update(member.id, { role: newRole });
      await loadStaff();
      notifySuccess(
        "Role updated",
        `${member.name} is now a ${ROLE_LABELS[newRole] ?? newRole}.`,
      );
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to update role"));
      notifyError(err, "Could not update role");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {(error || formError) && (
        <ErrorAlert
          title="Error"
          message={error ?? formError ?? ""}
          onRetry={() => void loadStaff()}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isPlatformAdmin
            ? "Clinic admin and receptionist logins for the selected tenant (password reset and enable/disable)."
            : "Receptionist accounts for your clinic. Other clinic admins are managed by the platform operator."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadStaff()}
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
              {isPlatformAdmin
                ? "Create a clinic admin or receptionist for this tenant"
                : "Create a receptionist for queue and patient workflows"}
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
              {total} account{total === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListDataToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name, email, or phone…"
              sortBy={sortBy}
              sortOptions={[
                { value: "name", label: "Name" },
                { value: "role", label: "Role" },
                { value: "createdAt", label: "Date added" },
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
            ) : staff.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No staff yet"
                description="Add receptionists or additional clinic admins."
              />
            ) : (
              <Table className="table-zebra">
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
                    const manageable = canManageMember(member);
                    const canEditRole =
                      manageable && !isSelf && isPlatformAdmin;

                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <span>
                            {member.name}
                          </span>
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
                          {manageable && !isSelf ? (
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
                          {manageable && !isSelf ? (
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
