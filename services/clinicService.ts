import api from "@/lib/api";
import type {
  Clinic,
  CreateClinicPayload,
  UpdateClinicPayload,
} from "@/types/clinic";

export const clinicService = {
  getMine() {
    return api.get<Clinic>("/clinics/me");
  },

  list() {
    return api.get<Clinic[]>("/clinics");
  },

  create(payload: CreateClinicPayload) {
    return api.post<Clinic>("/clinics", payload);
  },

  update(id: string, payload: UpdateClinicPayload) {
    return api.patch<Clinic>(`/clinics/${id}`, payload);
  },
};
