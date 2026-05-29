import api from "@/lib/api";
import type { CreatePatientPayload, Patient } from "@/types";

export const patientService = {
  list() {
    return api.get<Patient[]>("/patients");
  },

  create(payload: CreatePatientPayload) {
    return api.post<Patient>("/patients", payload);
  },
};
