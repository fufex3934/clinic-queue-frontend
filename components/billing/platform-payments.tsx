"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import Link from "next/link";
import {
  Building2,
  Check,
  DollarSign,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { ErrorAlert } from "@/components/shared/error-alert";
import { useConfirm } from "@/contexts/confirm-dialog-provider";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/toast";
import { setStoredOperationalClinicId } from "@/lib/clinic-scope";
import {
  formatPaymentWhen,
  getPaymentClinicMeta,
} from "@/lib/payment-request";
import {
  ChartPlot,
  KpiCard,
} from "@/components/dashboard/dashboard-chart-parts";
import {
  chartAxisTick,
  chartGridStroke,
  chartTooltipStyle,
} from "@/lib/chart-theme";
import { PlatformPaymentSettingsCard } from "@/components/billing/platform-payment-settings-card";
import { PlatformSubscriptionsOverview } from "@/components/billing/platform-subscriptions-overview";
import { SubscriptionStatusBadge } from "@/components/billing/subscription-status-badge";
import {
  daysUntilRenewLabel,
  formatRenewDate,
} from "@/lib/subscription-renewal";
import {
  paymentService,
  type BillingSummary,
  type PaymentRequest,
  type PaymentStatus,
  type RevenueMetrics,
  type SubscriptionPlan,
} from "@/services/paymentService";

function statusBadgeVariant(
  status: PaymentStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved":
      return "default";
    case "pending":
      return "secondary";
    case "rejected":
      return "destructive";
    default:
      return "outline";
  }
}

export function PlatformPaymentsDashboard() {
  const confirm = useConfirm();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "">("");
  const [planFilter, setPlanFilter] = useState<SubscriptionPlan | "">("");
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [billingClinicId, setBillingClinicId] = useState<string | null>(null);
  const [billingDetail, setBillingDetail] = useState<BillingSummary | null>(
    null,
  );
  const [billingLoading, setBillingLoading] = useState(false);

  const fetchPayments = useCallback(
    (params: Parameters<typeof paymentService.listAdmin>[0]) =>
      paymentService.listAdmin({
        ...params,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
      }),
    [statusFilter, planFilter],
  );

  const {
    items: payments,
    total: paymentsTotal,
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
    reload: reloadPayments,
  } = usePaginatedList<PaymentRequest>({
    fetcher: fetchPayments,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    resetDeps: [statusFilter, planFilter],
  });

  const loadRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const { data } = await paymentService.getRevenue();
      setRevenue(data);
    } catch (err: unknown) {
      notifyError(err, "Could not load revenue summary");
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRevenue();
  }, [loadRevenue]);

  const refreshAll = useCallback(async () => {
    await Promise.all([reloadPayments(), loadRevenue()]);
  }, [reloadPayments, loadRevenue]);

  const revenueChartData = useMemo(
    () =>
      revenue?.revenueByMonth.map((r) => ({
        month: r.month,
        revenue: r.amount,
      })) ?? [],
    [revenue],
  );

  const runAction = async (
    payment: PaymentRequest,
    action: "approve" | "reject",
  ) => {
    const clinic = getPaymentClinicMeta(payment);
    const ok = await confirm({
      title:
        action === "approve"
          ? "Approve subscription payment?"
          : "Reject payment request?",
      description:
        action === "approve"
          ? `Approve $${payment.amount} for ${clinic.name} (${payment.plan} plan)? Their subscription will be extended by 30 days.`
          : `Reject the payment from ${clinic.name}? They will need to submit a new request from Billing.`,
      confirmLabel: action === "approve" ? "Approve" : "Reject",
      cancelLabel: "Cancel",
      variant: action === "reject" ? "destructive" : "default",
    });
    if (!ok) return;

    setBusyId(payment._id);
    setActionError(null);
    try {
      if (action === "approve") {
        await paymentService.approve(payment._id);
        notifySuccess(
          "Subscription approved",
          `${clinic.name} can use the system for another 30 days on the ${payment.plan} plan.`,
        );
      } else {
        await paymentService.reject(payment._id);
        notifySuccess(
          "Payment rejected",
          `${clinic.name} was notified. They can submit a new request from Billing.`,
        );
      }
      await Promise.all([reloadPayments(), loadRevenue()]);
      if (billingClinicId === clinic.id) {
        setBillingClinicId(null);
        setBillingDetail(null);
      }
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, `Failed to ${action} payment`));
      notifyError(
        err,
        action === "approve"
          ? "Could not approve payment"
          : "Could not reject payment",
      );
    } finally {
      setBusyId(null);
    }
  };

  const openBilling = async (clinicId: string) => {
    setBillingClinicId(clinicId);
    setBillingLoading(true);
    setBillingDetail(null);
    setActionError(null);
    try {
      const { data } = await paymentService.getAdminBilling(clinicId);
      setBillingDetail(data);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Failed to load clinic subscription"));
      notifyError(err, "Could not load subscription details");
      setBillingClinicId(null);
    } finally {
      setBillingLoading(false);
    }
  };

  const billingClinicName = useMemo(() => {
    if (!billingClinicId) return null;
    const match = payments.find(
      (p) => getPaymentClinicMeta(p).id === billingClinicId,
    );
    return match ? getPaymentClinicMeta(match).name : "Clinic";
  }, [billingClinicId, payments]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Payment requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Clinics pay via your QR, then upload a receipt. You verify the receipt
            and approve to extend their subscription.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refreshAll()} disabled={loading || revenueLoading}>
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </header>

      {(error || actionError) && (
        <ErrorAlert
          title="Error"
          message={error ?? actionError ?? ""}
          onRetry={() => void refreshAll()}
        />
      )}

      <PlatformPaymentSettingsCard />

      <PlatformSubscriptionsOverview />

      <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">How to approve: </span>
        Open a pending row → <strong className="font-medium text-foreground">View</strong>{" "}
        the clinic&apos;s receipt (bank screenshot, not your payment QR) → confirm
        amount and plan match → <strong className="font-medium text-foreground">Approve</strong>{" "}
        or <strong className="font-medium text-foreground">Reject</strong> if invalid.
      </p>

      {revenue && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="MRR"
              value={`$${revenue.mrr}`}
              hint="From active subscriptions"
              icon={DollarSign}
              accent
            />
            <KpiCard
              label="Total revenue"
              value={`$${revenue.totalRevenue}`}
              hint="Approved payments"
              icon={DollarSign}
            />
            <KpiCard
              label="Active subs"
              value={revenue.activeSubscriptions}
              icon={DollarSign}
            />
            <KpiCard
              label="Approved payments"
              value={revenue.approvedPayments}
              icon={DollarSign}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by month</CardTitle>
              <CardDescription>
                Approved payment totals (cash collected)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] min-h-[280px]">
              {revenueChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No revenue data yet
                </p>
              ) : (
                <ChartPlot>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid
                      stroke={chartGridStroke}
                      vertical={false}
                    />
                    <XAxis dataKey="month" tick={chartAxisTick} />
                    <YAxis tick={chartAxisTick} />
                    <Tooltip
                      contentStyle={chartTooltipStyle.contentStyle}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartPlot>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {billingClinicId && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">
                Subscription — {billingClinicName}
              </CardTitle>
              <CardDescription>
                Current billing status for this clinic
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBillingClinicId(null);
                setBillingDetail(null);
              }}
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="text-sm">
            {billingLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : billingDetail ? (
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-0.5">
                    <SubscriptionStatusBadge
                      status={billingDetail.subscription.renewalStatus}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Plan</dt>
                  <dd className="font-medium capitalize">
                    {billingDetail.subscription.plan ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last paid</dt>
                  <dd className="font-medium">
                    {billingDetail.lastPaid
                      ? `${billingDetail.lastPaid.plan} · $${billingDetail.lastPaid.amount} · ${billingDetail.lastPaid.paidAt ? formatPaymentWhen(billingDetail.lastPaid.paidAt) : "—"}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Next renewal</dt>
                  <dd className="font-medium">
                    {formatRenewDate(
                      billingDetail.subscription.renewDate ??
                        billingDetail.subscription.endDate,
                    )}
                    {billingDetail.subscription.daysUntilRenew != null
                      ? ` (${daysUntilRenewLabel(billingDetail.subscription.daysUntilRenew)})`
                      : null}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Current term</dt>
                  <dd className="font-medium">
                    {billingDetail.subscription.startDate &&
                    billingDetail.subscription.endDate
                      ? `${formatRenewDate(billingDetail.subscription.startDate)} – ${formatRenewDate(billingDetail.subscription.endDate)}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Latest request</dt>
                  <dd className="font-medium capitalize">
                    {billingDetail.latestPayment
                      ? `${billingDetail.latestPayment.status} · $${billingDetail.latestPayment.amount}`
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All requests</CardTitle>
          <CardDescription>
            Approving creates or extends a 30-day subscription for the clinic.
            Pending rows can be approved or rejected; approved rows show
            subscription details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-x-auto">
          <ListDataToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search clinic name…"
            sortBy={sortBy}
            sortOptions={[
              { value: "createdAt", label: "Submitted date" },
              { value: "amount", label: "Amount" },
              { value: "plan", label: "Plan" },
              { value: "status", label: "Status" },
            ]}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            page={page}
            totalPages={totalPages}
            total={paymentsTotal}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
          >
            <div className="flex flex-wrap gap-2">
              <div className="space-y-1">
                <Label htmlFor="pay-filter-status" className="text-xs text-muted-foreground">
                  Status
                </Label>
                <select
                  id="pay-filter-status"
                  className="flex h-9 min-w-[8rem] rounded-md border border-input bg-transparent px-2 text-sm"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PaymentStatus | "");
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="pay-filter-plan" className="text-xs text-muted-foreground">
                  Plan
                </Label>
                <select
                  id="pay-filter-plan"
                  className="flex h-9 min-w-[8rem] rounded-md border border-input bg-transparent px-2 text-sm"
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value as SubscriptionPlan | "");
                    setPage(1);
                  }}
                >
                  <option value="">All plans</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </ListDataToolbar>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment requests match your filters
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const clinic = getPaymentClinicMeta(p);
                  const busy = busyId === p._id;

                  return (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">
                        {clinic.name}
                      </TableCell>
                      <TableCell className="capitalize">{p.plan}</TableCell>
                      <TableCell>${p.amount}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(p.status)}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatPaymentWhen(p.createdAt)}
                        {p.status === "approved" && p.approvedAt && (
                          <span className="mt-0.5 block text-xs">
                            Approved {formatPaymentWhen(p.approvedAt)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.proofImage ? (
                          <a
                            href={p.proofImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary underline"
                          >
                            View
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1">
                          {p.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() => void runAction(p, "approve")}
                              >
                                <Check className="mr-1 size-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() => void runAction(p, "reject")}
                              >
                                <X className="mr-1 size-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          {p.status === "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={billingLoading}
                              onClick={() => void openBilling(clinic.id)}
                            >
                              Subscription
                            </Button>
                          )}
                          {p.proofImage && p.status !== "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              render={
                                <a
                                  href={p.proofImage}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                />
                              }
                            >
                              <ExternalLink className="mr-1 size-3" />
                              Proof
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setStoredOperationalClinicId(clinic.id)
                            }
                            render={
                              <Link
                                href="/dashboard/admin"
                                title="Manage clinic and accounts"
                              />
                            }
                          >
                            <Building2 className="mr-1 size-3" />
                            Clinic
                          </Button>
                        </div>
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
  );
}
