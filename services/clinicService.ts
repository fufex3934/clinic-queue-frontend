import api from "@/lib/api";
import type {
  Clinic,
  CreateClinicPayload,
  UpdateClinicPayload,
} from "@/types/clinic";
import type { ListQueryParams, PaginatedResult } from "@/types/pagination";

export const clinicService = {
  getMine() {
    return api.get<Clinic>("/clinics/me");
  },

  list(params?: ListQueryParams) {
    return api.get<PaginatedResult<Clinic>>("/clinics", { params });
  },

  getById(id: string) {
    return api.get<Clinic>(`/clinics/${id}`);
  },

  create(payload: CreateClinicPayload) {
    return api.post<Clinic>("/clinics", payload);
  },

  update(id: string, payload: UpdateClinicPayload) {
    return api.patch<Clinic>(`/clinics/${id}`, payload);
  },

  deactivate(id: string) {
    return api.delete<Clinic>(`/clinics/${id}`);
  },

  deletePermanent(id: string) {
    return api.delete<{ deleted: boolean; id: string }>(`/clinics/${id}`, {
      params: { permanent: "true" },
    });
  },
};
