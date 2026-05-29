import api from "@/lib/api";
import type {
  CreateStaffPayload,
  StaffUser,
  UpdateStaffPayload,
} from "@/types/user";

export const userService = {
  list(clinicId?: string) {
    return api.get<StaffUser[]>("/users", {
      params: clinicId ? { clinicId } : undefined,
    });
  },

  create(payload: CreateStaffPayload) {
    return api.post<StaffUser>("/users", payload);
  },

  update(id: string, payload: UpdateStaffPayload) {
    return api.patch<StaffUser>(`/users/${id}`, payload);
  },
};
