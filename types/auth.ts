export type UserRole = "admin" | "receptionist" | "platform_admin";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  clinicId: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface SessionResponse {
  user: AuthUser;
}
