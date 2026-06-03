import type { PaymentRequest, PopulatedClinicRef } from "@/services/paymentService";

export function getPaymentClinicMeta(payment: PaymentRequest): {
  id: string;
  name: string;
  location?: string;
} {
  const raw = payment.clinicId;
  if (typeof raw === "object" && raw !== null && "_id" in raw) {
    const clinic = raw as PopulatedClinicRef;
    return {
      id: String(clinic._id),
      name: clinic.name ?? "Unknown clinic",
      location: clinic.location,
    };
  }
  return { id: String(raw), name: "Clinic" };
}

export function formatPaymentWhen(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
