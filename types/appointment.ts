import type { PatientRef } from "./patient";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "arrived"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  _id: string;
  patientId: PatientRef;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  date: string;
  timeSlot: string;
}

export interface ArriveAppointmentResponse {
  appointment: Appointment;
  queueEntry: {
    _id: string;
    tokenNumber: number;
    status: string;
  };
}
