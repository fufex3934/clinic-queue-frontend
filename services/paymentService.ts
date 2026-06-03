import api from "@/lib/api";
import type { ListQueryParams, PaginatedResult } from "@/types/pagination";

export type SubscriptionPlan = "starter" | "professional" | "enterprise";
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface PopulatedClinicRef {
  _id: string;
  name?: string;
  location?: string;
}

export interface PaymentRequest {
  _id: string;
  clinicId: string | PopulatedClinicRef;
  plan: SubscriptionPlan;
  amount: number;
  status: PaymentStatus;
  proofImage?: string;
  createdAt?: string;
  approvedAt?: string;
}

export type RenewalStatus =
  | "none"
  | "active"
  | "expiring_soon"
  | "grace"
  | "expired";

export interface SubscriptionBillingStatus {
  isActive: boolean;
  inGracePeriod: boolean;
  plan: SubscriptionPlan | null;
  startDate: string | null;
  endDate: string | null;
  renewDate: string | null;
  graceEndDate: string | null;
  daysUntilRenew: number | null;
  daysLeftInGrace: number | null;
  renewalStatus: RenewalStatus;
  shouldNotifyRenewal: boolean;
}

export interface PaymentTimelineEntry {
  id: string;
  plan: SubscriptionPlan;
  amount: number;
  paidAt: string | null;
}

export interface BillingSummary {
  subscription: SubscriptionBillingStatus;
  latestPayment: {
    id: string;
    plan: SubscriptionPlan;
    amount: number;
    status: PaymentStatus;
    createdAt?: string;
  } | null;
  lastPaid: {
    plan: SubscriptionPlan;
    amount: number;
    paidAt: string | null;
  } | null;
  timeline: PaymentTimelineEntry[];
  renewalAlert: {
    level: "info" | "warning" | "error";
    title: string;
    message: string;
    renewDate: string | null;
  } | null;
}

export interface ClinicSubscriptionOverview {
  clinicId: string;
  clinicName: string;
  location: string;
  clinicIsActive: boolean;
  isActive: boolean;
  inGracePeriod: boolean;
  plan: SubscriptionPlan | null;
  startDate: string | null;
  endDate: string | null;
  renewDate: string | null;
  graceEndDate: string | null;
  daysUntilRenew: number | null;
  daysLeftInGrace: number | null;
  renewalStatus: RenewalStatus;
  shouldNotifyRenewal: boolean;
  lastPaid: {
    plan: string;
    amount: number;
    paidAt: string | null;
  } | null;
}

export interface RevenueMetrics {
  mrr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  approvedPayments: number;
  revenueByMonth: { month: string; amount: number }[];
}

export interface PlatformPaymentConfig {
  paymentQrImageUrl: string | null;
  paymentInstructions: string | null;
  updatedAt: string | null;
}

export const paymentService = {
  getBilling() {
    return api.get<BillingSummary>("/payments/billing");
  },

  listMy(params?: ListQueryParams) {
    return api.get<PaginatedResult<PaymentRequest>>("/payments/my", {
      params,
    });
  },

  createRequest(payload: { plan: SubscriptionPlan; amount?: number }) {
    return api.post<PaymentRequest>("/payments/request", payload);
  },

  uploadProof(requestId: string, proofImage: string) {
    return api.post<PaymentRequest>(
      "/payments/upload-proof",
      { proofImage },
      { params: { requestId } },
    );
  },

  uploadProofFile(requestId: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return api.post<PaymentRequest>("/payments/upload-proof", form, {
      params: { requestId },
    });
  },

  getRevenue() {
    return api.get<RevenueMetrics>("/payments/admin/revenue");
  },

  listAdmin(
    params?: ListQueryParams & {
      clinicId?: string;
      status?: PaymentStatus;
      plan?: SubscriptionPlan;
    },
  ) {
    return api.get<PaginatedResult<PaymentRequest>>("/payments/admin", {
      params,
    });
  },

  approve(id: string) {
    return api.patch<PaymentRequest>(`/payments/${id}/approve`);
  },

  reject(id: string) {
    return api.patch<PaymentRequest>(`/payments/${id}/reject`);
  },

  getAdminBilling(clinicId: string) {
    return api.get<BillingSummary>("/payments/admin/billing", {
      params: { clinicId },
    });
  },

  listAdminSubscriptions(
    params?: ListQueryParams & {
      renewalStatus?: RenewalStatus;
      sortBy?: "name" | "renewDate" | "lastPaidAt" | "createdAt";
    },
  ) {
    return api.get<PaginatedResult<ClinicSubscriptionOverview>>(
      "/payments/admin/subscriptions",
      { params },
    );
  },

  getPaymentConfig() {
    return api.get<PlatformPaymentConfig>("/payments/payment-config");
  },

  getAdminPaymentSettings() {
    return api.get<PlatformPaymentConfig>("/payments/admin/payment-settings");
  },

  updateAdminPaymentSettings(payload: { paymentInstructions?: string }) {
    return api.patch<PlatformPaymentConfig>(
      "/payments/admin/payment-settings",
      payload,
    );
  },

  uploadAdminPaymentQr(file: File) {
    const form = new FormData();
    form.append("file", file);
    return api.post<PlatformPaymentConfig>(
      "/payments/admin/payment-settings/qr",
      form,
    );
  },
};
