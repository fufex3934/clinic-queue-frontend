"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { PaymentQrDisplay } from "@/components/billing/payment-qr-display";
import { SubscriptionStatusBadge } from "@/components/billing/subscription-status-badge";
import { SubscriptionTimeline } from "@/components/billing/subscription-timeline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ErrorAlert } from "@/components/shared/error-alert";
import { getErrorMessage } from "@/lib/errors";
import { ListDataToolbar } from "@/components/shared/list-data-toolbar";
import { useLocale } from "@/contexts/locale-provider";
import {
  formatDualCurrency,
  formatPlanPricePrimary,
  PLAN_USD,
  TELEBIRR_PAYMENT_HINT,
} from "@/lib/billing-local";
import {
  daysUntilRenewLabel,
  formatRenewDate,
} from "@/lib/subscription-renewal";
import { notifyError, notifySuccess } from "@/lib/toast";
import {
  paymentService,
  type BillingSummary,
  type PaymentRequest,
  type PlatformPaymentConfig,
  type SubscriptionPlan,
} from "@/services/paymentService";

const PLANS: { id: SubscriptionPlan; label: string; price: number }[] = [
  { id: "starter", label: "Starter", price: PLAN_USD.starter },
  { id: "professional", label: "Professional", price: PLAN_USD.professional },
  { id: "enterprise", label: "Enterprise", price: PLAN_USD.enterprise },
];

export function BillingPage() {
  const { translate } = useLocale();
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [paymentConfig, setPaymentConfig] =
    useState<PlatformPaymentConfig | null>(null);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [plan, setPlan] = useState<SubscriptionPlan>("starter");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => PLANS.find((p) => p.id === plan),
    [plan],
  );

  const pendingPayment = useMemo(
    () => payments.find((p) => p._id === pendingId),
    [payments, pendingId],
  );

  const payAmountLabel = useMemo(() => {
    if (pendingPayment) {
      const label =
        PLANS.find((p) => p.id === pendingPayment.plan)?.label ??
        pendingPayment.plan;
      return `Pay ${formatDualCurrency(pendingPayment.amount)} — ${label} (monthly)`;
    }
    if (selectedPlan) {
      return `Pay ${formatDualCurrency(selectedPlan.price)} — ${selectedPlan.label} (monthly)`;
    }
    return undefined;
  }, [pendingPayment, selectedPlan]);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [billingRes, paymentsRes, configRes] = await Promise.all([
        paymentService.getBilling(),
        paymentService.listMy({
          page: historyPage,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        paymentService.getPaymentConfig(),
      ]);
      setBilling(billingRes.data);
      setPayments(paymentsRes.data.items);
      setPaymentsTotal(paymentsRes.data.total);
      setHistoryTotalPages(paymentsRes.data.totalPages);
      setHistoryPage(paymentsRes.data.page);
      setPaymentConfig(configRes.data);
      const pending = paymentsRes.data.items.find(
        (p: PaymentRequest) => p.status === "pending",
      );
      setPendingId(pending?._id ?? null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load billing"));
    } finally {
      setLoading(false);
    }
  }, [historyPage]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRequest = async () => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await paymentService.createRequest({
        plan,
        amount: selectedPlan?.price ?? 0,
      });
      setPendingId(data._id);
      await load();
      notifySuccess(
        "Payment request submitted",
        "Pay using the QR above, then upload your receipt. We will review and activate your subscription.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit payment request"));
      notifyError(err, "Could not submit payment request");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProof = async () => {
    if (!pendingId || !proofFile) return;
    setSaving(true);
    setError(null);
    try {
      await paymentService.uploadProofFile(pendingId, proofFile);
      setProofFile(null);
      await load();
      notifySuccess(
        "Receipt uploaded",
        "Your payment proof was sent. You will be notified when the platform approves your subscription.",
      );
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to upload proof"));
      notifyError(err, "Could not upload payment receipt");
    } finally {
      setSaving(false);
    }
  };

  const sub = billing?.subscription;
  const hasQr = Boolean(paymentConfig?.paymentQrImageUrl);
  const hasPaySection =
    hasQr || Boolean(paymentConfig?.paymentInstructions?.trim());

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1 text-center sm:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          {translate("billingTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("billingSubtitle")} {TELEBIRR_PAYMENT_HINT}
        </p>
      </header>

      {error && <ErrorAlert title="Billing error" message={error} onRetry={load} />}

      {billing?.renewalAlert && (
        <div
          className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${
            billing.renewalAlert.level === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : billing.renewalAlert.level === "warning"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-950 dark:text-cyan-50"
          }`}
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">{billing.renewalAlert.title}</p>
            <p className="mt-0.5 opacity-90">{billing.renewalAlert.message}</p>
          </div>
        </div>
      )}

      {hasPaySection && paymentConfig && (
        <Card className="overflow-hidden border-primary/25 shadow-md">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4 text-center sm:text-left">
            <CardTitle className="text-lg">{translate("billingPayTitle")}</CardTitle>
            <CardDescription>{translate("billingPayDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-6 sm:px-8 sm:py-8">
            {hasQr && paymentConfig.paymentQrImageUrl && (
              <PaymentQrDisplay
                variant="scan"
                imageUrl={paymentConfig.paymentQrImageUrl}
                instructions={paymentConfig.paymentInstructions}
                amountLabel={payAmountLabel}
              />
            )}
            {!hasQr && paymentConfig.paymentInstructions?.trim() && (
              <div className="mx-auto w-full max-w-md space-y-3 text-center">
                {payAmountLabel && (
                  <p className="text-lg font-semibold">{payAmountLabel}</p>
                )}
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Payment details
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {paymentConfig.paymentInstructions.trim()}
                  </p>
                </div>
              </div>
            )}
            {!hasQr && !loading && (
              <p className="mt-4 text-center text-sm text-amber-700 dark:text-amber-400">
                Payment QR is not configured yet. Use the payment details above
                or contact platform support.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!hasQr && !paymentConfig?.paymentInstructions && !loading && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-800 dark:text-amber-200">
          Payment QR is not configured yet. Contact platform support before paying.
        </p>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Current plan
            </CardTitle>
            <CardDescription>
              {loading
                ? "Loading…"
                : sub?.renewDate
                  ? `Next term payment due by ${formatRenewDate(sub.renewDate)}`
                  : "Subscription status"}
            </CardDescription>
          </div>
          {sub?.renewalStatus && (
            <SubscriptionStatusBadge status={sub.renewalStatus} />
          )}
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Plan:</span>{" "}
            <span className="capitalize">{sub?.plan ?? "—"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Current term:</span>{" "}
            {sub?.startDate && sub?.endDate
              ? `${formatRenewDate(sub.startDate)} – ${formatRenewDate(sub.endDate)}`
              : "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Renew by:</span>{" "}
            {formatRenewDate(sub?.renewDate ?? sub?.endDate)}
            {sub?.daysUntilRenew != null ? (
              <span className="text-muted-foreground">
                {" "}
                ({daysUntilRenewLabel(sub.daysUntilRenew)})
              </span>
            ) : null}
          </p>
          {billing?.lastPaid && (
            <p>
              <span className="text-muted-foreground">Last paid:</span>{" "}
              <span className="capitalize">{billing.lastPaid.plan}</span> · $
              {billing.lastPaid.amount}
              {billing.lastPaid.paidAt
                ? ` on ${formatRenewDate(billing.lastPaid.paidAt)}`
                : null}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription timeline</CardTitle>
          <CardDescription>
            Approved payments extend your subscription by 30 days each term
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionTimeline billing={billing} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request renewal</CardTitle>
          <CardDescription>
            {hasQr
              ? "After paying via QR, submit your request and upload proof"
              : "Submit a payment request; platform admin will approve after proof review"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billing-plan">Plan</Label>
            <select
              id="billing-plan"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={plan}
              onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
              disabled={saving || Boolean(pendingId)}
            >
              {PLANS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {formatPlanPricePrimary(p.price)}
                  {translate("billingPerMonth")} ({translate("billingGuidePrice")})
                </option>
              ))}
            </select>
          </div>

          {!pendingId ? (
            <>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Step 3 — </span>
                Submit after you have paid{" "}
                {selectedPlan ? `$${selectedPlan.price}` : "the selected amount"}.
              </p>
              <Button
                className="w-full sm:w-auto"
                onClick={() => void handleRequest()}
                disabled={saving}
              >
                {saving ? "Submitting…" : "Submit payment request"}
              </Button>
            </>
          ) : (
            <>
              <p className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Step 3 — </span>
                Upload your bank/wallet receipt (screenshot or PDF). Do not
                upload the payment QR — that stays on this page for scanning only.
              </p>
              <Label htmlFor="billing-proof-file" className="sr-only">
                Payment receipt
              </Label>
              <input
                id="billing-proof-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                className="block w-full text-sm"
                onChange={(e) =>
                  setProofFile(e.target.files?.[0] ?? null)
                }
              />
              <Button
                className="w-full sm:w-auto"
                onClick={() => void handleUploadProof()}
                disabled={saving || !proofFile}
              >
                {saving ? "Uploading…" : "Upload proof"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {paymentsTotal > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment history</CardTitle>
            <CardDescription>{paymentsTotal} past requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ListDataToolbar
              showSearch={false}
              search=""
              onSearchChange={() => {}}
              sortBy="createdAt"
              sortOptions={[{ value: "createdAt", label: "Date" }]}
              onSortByChange={() => {}}
              sortOrder="desc"
              onSortOrderChange={() => {}}
              page={historyPage}
              totalPages={historyTotalPages}
              total={paymentsTotal}
              onPageChange={setHistoryPage}
              limit={10}
            />
            <ul className="space-y-2 text-sm">
              {payments.map((p) => (
                <li key={p._id} className="flex justify-between gap-2">
                  <span>
                    {p.plan} · ${p.amount}
                  </span>
                  <span className="text-muted-foreground">{p.status}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
