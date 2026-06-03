import type { SubscriptionPlan } from "@/services/paymentService";

/** USD list prices — shown alongside ETB guide for Ethiopian clinics. */
export const PLAN_USD: Record<SubscriptionPlan, number> = {
  starter: 29,
  professional: 79,
  enterprise: 199,
};

/** Approximate ETB guide (update rate in one place). */
export const USD_TO_ETB = 57;

export function etbFromUsd(usd: number): number {
  return Math.round(usd * USD_TO_ETB);
}

export function formatEtb(amount: number): string {
  return `${amount.toLocaleString("en-ET")} ETB`;
}

export function formatPlanPriceEtb(plan: SubscriptionPlan): string {
  return formatEtb(etbFromUsd(PLAN_USD[plan]));
}

export function formatDualCurrency(usd: number): string {
  return `$${usd} · ~${formatEtb(etbFromUsd(usd))}`;
}

export const TELEBIRR_PAYMENT_HINT =
  "Pay with Telebirr, bank transfer, or cash — upload your receipt after payment.";
