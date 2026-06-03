"use client";

import { formatPaymentWhen } from "@/lib/payment-request";
import { formatRenewDate } from "@/lib/subscription-renewal";
import type { BillingSummary } from "@/services/paymentService";

type SubscriptionTimelineProps = {
  billing: BillingSummary | null;
};

export function SubscriptionTimeline({ billing }: SubscriptionTimelineProps) {
  const sub = billing?.subscription;
  const timeline = billing?.timeline ?? [];

  if (!sub?.startDate && timeline.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No subscription history yet. Approved payments will appear here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {sub?.startDate && sub.endDate && (
        <div className="relative rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current term
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatRenewDate(sub.startDate)} → {formatRenewDate(sub.endDate)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Next renewal due by {formatRenewDate(sub.renewDate ?? sub.endDate)}
            {sub.inGracePeriod && sub.graceEndDate
              ? ` · Grace until ${formatRenewDate(sub.graceEndDate)}`
              : null}
          </p>
        </div>
      )}

      {timeline.length > 0 && (
        <ol className="relative space-y-0 border-l border-border pl-6">
          {timeline.map((entry, index) => (
            <li key={entry.id} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-[1.55rem] top-1.5 size-2.5 rounded-full bg-primary ring-4 ring-background"
                aria-hidden
              />
              <p className="text-sm font-medium capitalize">
                {entry.plan} plan · ${entry.amount}
              </p>
              <p className="text-xs text-muted-foreground">
                Paid {entry.paidAt ? formatPaymentWhen(entry.paidAt) : "—"}
                {index === 0 ? " · Latest" : null}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
