"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { SubscriptionStatusBadge } from "@/components/billing/subscription-status-badge";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { notifyError, notifySuccess } from "@/lib/toast";
import { clinicService } from "@/services/clinicService";
import { formatPaymentWhen } from "@/lib/payment-request";
import {
  daysUntilRenewLabel,
  formatRenewDate,
  type RenewalStatus,
} from "@/lib/subscription-renewal";
import { getErrorMessage } from "@/lib/errors";
import {
  paymentService,
  type ClinicSubscriptionOverview,
} from "@/services/paymentService";

export function PlatformSubscriptionsOverview() {
  const confirm = useConfirm();
  const [items, setItems] = useState<ClinicSubscriptionOverview[]>([]);
  const [busyClinicId, setBusyClinicId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("renewDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<RenewalStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await paymentService.listAdminSubscriptions({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        sortBy: sortBy as "name" | "renewDate" | "lastPaidAt",
        sortOrder,
        renewalStatus: statusFilter || undefined,
      });
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load subscriptions"));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortOrder, limit, statusFilter]);

  const expiringCount = items.filter((r) => r.shouldNotifyRenewal).length;

  const handleDeactivate = async (row: ClinicSubscriptionOverview) => {
    const ok = await confirm({
      title: "Deactivate clinic?",
      description: `${row.clinicName} will be suspended until they pay and you reactivate them.`,
      confirmLabel: "Deactivate",
      cancelLabel: "Cancel",
      variant: "destructive",
    });
    if (!ok) return;
    setBusyClinicId(row.clinicId);
    try {
      await clinicService.deactivate(row.clinicId);
      await load();
      notifySuccess(
        "Clinic deactivated",
        `${row.clinicName} is suspended until payment is received.`,
      );
    } catch (err: unknown) {
      notifyError(err, "Could not deactivate clinic");
    } finally {
      setBusyClinicId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" />
          Clinic subscriptions
        </CardTitle>
        <CardDescription>
          Last payment, next renewal date, and status for every tenant. Clinics
          with 7 days or less until renewal (or in grace / expired) trigger
          notifications on login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {expiringCount > 0 && statusFilter === "" && (
          <p className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            <AlertTriangle className="size-4 shrink-0" />
            {expiringCount} clinic(s) on this page need renewal attention.
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <ListDataToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search clinic…"
          sortBy={sortBy}
          sortOptions={[
            { value: "renewDate", label: "Renewal date" },
            { value: "lastPaidAt", label: "Last paid" },
            { value: "name", label: "Clinic name" },
          ]}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        >
          <select
            className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RenewalStatus | "")
            }
            aria-label="Filter by subscription status"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="expiring_soon">Renewal due soon</option>
            <option value="grace">Grace period</option>
            <option value="expired">Expired</option>
            <option value="none">No subscription</option>
          </select>
        </ListDataToolbar>

        <div className="overflow-x-auto">
          <Table className="table-zebra">
            <TableHeader>
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead>Last paid</TableHead>
                <TableHead>Next renewal</TableHead>
                <TableHead>Time left</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No clinics match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow
                    key={row.clinicId}
                    className={
                      row.shouldNotifyRenewal ? "bg-amber-500/5" : undefined
                    }
                  >
                    <TableCell>
                      <p className="font-medium">{row.clinicName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.location}
                        {!row.clinicIsActive ? " · Deactivated" : null}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.lastPaid ? (
                        <>
                          <span className="capitalize">{row.lastPaid.plan}</span>
                          {" · "}${row.lastPaid.amount}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {row.lastPaid.paidAt
                              ? formatPaymentWhen(row.lastPaid.paidAt)
                              : "—"}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatRenewDate(row.renewDate)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {daysUntilRenewLabel(row.daysUntilRenew)}
                    </TableCell>
                    <TableCell>
                      <SubscriptionStatusBadge status={row.renewalStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          render={
                            <Link
                              href={`/dashboard/admin/payments?clinic=${row.clinicId}`}
                            />
                          }
                        >
                          Payments
                        </Button>
                        {!row.clinicIsActive ? (
                          <Badge variant="secondary">Suspended</Badge>
                        ) : row.shouldNotifyRenewal ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyClinicId === row.clinicId}
                              onClick={() => void handleDeactivate(row)}
                            >
                              Deactivate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              render={
                                <Link href="/dashboard/admin" />
                              }
                            >
                              Admin
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {loading && (
          <p className="text-sm text-muted-foreground">Loading subscriptions…</p>
        )}
      </CardContent>
    </Card>
  );
}
