"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/shared/error-alert";
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { getErrorMessage } from "@/lib/errors";
import {
  userService,
  type PlatformUserRow,
} from "@/services/userService";
import type { UserRole } from "@/types/auth";

export function PlatformUsersTable() {
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const fetchUsers = useCallback(
    (params: Parameters<typeof userService.listPlatformAll>[0]) =>
      userService.listPlatformAll({
        ...params,
        role: roleFilter || undefined,
        isActive:
          activeFilter === ""
            ? undefined
            : activeFilter === "true",
      }),
    [roleFilter, activeFilter],
  );

  const {
    items: users,
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
  } = usePaginatedList<PlatformUserRow>({
    fetcher: fetchUsers,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    resetDeps: [roleFilter, activeFilter],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">All users</h1>
          <p className="text-sm text-muted-foreground">
            Platform-wide staff and administrators across every clinic
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void reload()} disabled={loading}>
          <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {error && <ErrorAlert title="Error" message={error} onRetry={() => void reload()} />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            User directory
          </CardTitle>
          <CardDescription>
            {loading ? "Loading…" : `${total} accounts`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <ListDataToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, or phone…"
            sortBy={sortBy}
            sortOptions={[
              { value: "createdAt", label: "Date added" },
              { value: "name", label: "Name" },
              { value: "role", label: "Role" },
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
          >
            <div className="flex flex-wrap gap-2">
              <div className="space-y-1">
                <Label htmlFor="filter-role" className="text-xs text-muted-foreground">
                  Role
                </Label>
                <select
                  id="filter-role"
                  className="flex h-9 min-w-[8rem] rounded-md border border-input bg-transparent px-2 text-sm"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as UserRole | "");
                    setPage(1);
                  }}
                >
                  <option value="">All roles</option>
                  <option value="platform_admin">Platform admin</option>
                  <option value="admin">Clinic admin</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="filter-active" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <select
                  id="filter-active"
                  className="flex h-9 min-w-[8rem] rounded-md border border-input bg-transparent px-2 text-sm"
                  value={activeFilter}
                  onChange={(e) => {
                    setActiveFilter(e.target.value as "" | "true" | "false");
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
          </ListDataToolbar>

          {users.length === 0 && !loading ? (
            <p className="text-sm text-muted-foreground">No users match your filters</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email / phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email ?? u.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{u.clinicName}</p>
                        {u.clinicLocation && (
                          <p className="text-xs text-muted-foreground">
                            {u.clinicLocation}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge>Active</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        render={<Link href={`/dashboard/admin/users/${u.id}`} />}
                      >
                        View
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
  );
}
