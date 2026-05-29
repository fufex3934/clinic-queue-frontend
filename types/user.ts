import type { UserRole } from "./auth";

export interface StaffUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  clinicId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffPayload {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  clinicId: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
  isActive?: boolean;
}
