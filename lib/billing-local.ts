import type { SubscriptionPlan } from "@/services/paymentService";

/** USD list prices (platform billing). */
export const PLAN_USD: Record<SubscriptionPlan, number> = {
  starter: 29,
  professional: 79,
  enterprise: 199,
};

/** Approximate ETB per USD — override via NEXT_PUBLIC_USD_TO_ETB. */
export const USD_TO_ETB = Number(
  process.env.NEXT_PUBLIC_USD_TO_ETB ?? "57",
) || 57;

export function etbFromUsd(usd: number): number {
  return Math.round(usd * USD_TO_ETB);
}

export function formatEtb(amount: number): string {
  return `${amount.toLocaleString("en-ET")} ETB`;
}

export function formatPlanPriceEtb(plan: SubscriptionPlan): string {
  return formatEtb(etbFromUsd(PLAN_USD[plan]));
}

/** ETB-first label for clinics in Ethiopia. */
export function formatPlanPricePrimary(usd: number): string {
  return `${formatEtb(etbFromUsd(usd))} (~$${usd})`;
}

export function formatDualCurrency(usd: number): string {
  return formatPlanPricePrimary(usd);
}

export const TELEBIRR_PAYMENT_HINT =
  "Pay with Telebirr, CBE, Dashen, or cash — then upload your receipt below.";
