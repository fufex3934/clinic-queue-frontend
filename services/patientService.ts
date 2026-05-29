import api from "@/lib/api";
import type { CreatePatientPayload, Patient } from "@/types";

type Scope = { clinicId?: string; search?: string };

export const patientService = {
  list(scope?: Scope) {
    return api.get<Patient[]>("/patients", { params: scope });
  },

  getById(id: string, scope?: { clinicId?: string }) {
    return api.get<Patient>(`/patients/${id}`, { params: scope });
  },

  create(payload: CreatePatientPayload, scope?: { clinicId?: string }) {
    return api.post<Patient>("/patients", payload, { params: scope });
  },

  update(
    id: string,
    payload: CreatePatientPayload,
    scope?: { clinicId?: string },
  ) {
    return api.patch<Patient>(`/patients/${id}`, payload, { params: scope });
  },
};
