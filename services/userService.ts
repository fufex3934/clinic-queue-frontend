import api from "@/lib/api";
import type { UserRole } from "@/types/auth";
import type { ListQueryParams, PaginatedResult } from "@/types/pagination";
import type {
  CreateStaffPayload,
  StaffUser,
  UpdateStaffPayload,
} from "@/types/user";

export interface PlatformUserRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  clinicId: string;
  clinicName: string;
  clinicLocation?: string;
  isActive: boolean;
  createdAt?: string;
}

type PlatformListParams = ListQueryParams & {
  clinicId?: string;
  role?: UserRole;
  isActive?: boolean;
};

export const userService = {
  list(params?: ListQueryParams & { clinicId?: string }) {
    return api.get<PaginatedResult<StaffUser>>("/users", { params });
  },

  listPlatformAll(params?: PlatformListParams) {
    return api.get<PaginatedResult<PlatformUserRow>>("/users/platform/all", {
      params,
    });
  },

  create(payload: CreateStaffPayload) {
    return api.post<StaffUser>("/users", payload);
  },

  update(id: string, payload: UpdateStaffPayload) {
    return api.patch<StaffUser>(`/users/${id}`, payload);
  },

  getById(id: string) {
    return api.get<StaffUser>(`/users/${id}`);
  },
};
