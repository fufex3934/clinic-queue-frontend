import type { PatientRef } from "@/types/patient";

export function getPatientName(patientId: PatientRef): string {
  if (typeof patientId === "object" && patientId !== null && "name" in patientId) {
    return patientId.name;
  }
  return "Unknown patient";
}

export function getPatientPhone(patientId: PatientRef): string {
  if (typeof patientId === "object" && patientId !== null && "phone" in patientId) {
    return patientId.phone;
  }
  return "—";
}
