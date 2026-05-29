export interface Patient {
  _id: string;
  name: string;
  phone: string;
  clinicId?: string;
  createdAt?: string;
}

export type PatientRef = Patient | string;

export interface CreatePatientPayload {
  name: string;
  phone: string;
}
