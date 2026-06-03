import type { PatientGender, PatientRef } from "@/types/patient";

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

export function formatPatientGender(gender: PatientGender | null | undefined): string {
  if (!gender) return "—";
  switch (gender) {
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "other":
      return "Other";
    case "prefer_not_to_say":
      return "Prefer not to say";
    default:
      return gender;
  }
}

export function formatPatientAge(
  ageYears: number | null | undefined,
  dateOfBirth: string | null | undefined,
): string {
  if (ageYears != null) return `${ageYears} yrs`;
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age -= 1;
    return `${age} yrs`;
  }
  return "—";
}

export const PATIENT_GENDER_OPTIONS: { value: PatientGender; label: string }[] =
  [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];
