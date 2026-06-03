export interface Clinic {
  _id: string;
  name: string;
  location: string;
  phone?: string | null;
  email?: string | null;
  timezone?: string;
  addressLine?: string | null;
  city?: string | null;
  country?: string | null;
  isActive?: boolean;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  maxAppointmentsPerSlot?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClinicContactFields {
  phone?: string;
  email?: string;
  timezone?: string;
  addressLine?: string;
  city?: string;
  country?: string;
}

export interface CreateClinicPayload {
  name: string;
  location: string;
  phone?: string;
  email?: string;
  timezone?: string;
  addressLine?: string;
  city?: string;
  country?: string;
}

export interface UpdateClinicPayload extends ClinicContactFields {
  name?: string;
  location?: string;
  isActive?: boolean;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  maxAppointmentsPerSlot?: number;
}
