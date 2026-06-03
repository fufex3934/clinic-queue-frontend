export type PatientGender =
  | "male"
  | "female"
  | "other"
  | "prefer_not_to_say";

export interface Patient {
  _id: string;
  name: string;
  phone: string;
  clinicId?: string;
  dateOfBirth?: string | null;
  ageYears?: number | null;
  gender?: PatientGender | null;
  secondaryPhone?: string | null;
  notes?: string | null;
  createdAt?: string;
  lastVisitAt?: string | null;
}

export type PatientRef = Patient | string;

export interface PatientProfileFields {
  dateOfBirth?: string;
  gender?: PatientGender;
  secondaryPhone?: string;
  notes?: string;
}

export interface CreatePatientPayload {
  name: string;
  phone: string;
  dateOfBirth?: string;
  gender?: PatientGender;
  secondaryPhone?: string;
  notes?: string;
}

export interface UpdatePatientPayload extends CreatePatientPayload {}
