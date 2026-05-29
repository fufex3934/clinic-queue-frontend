import axios from "axios";
import type {
  AuthResponse,
  LoginCredentials,
  SessionResponse,
} from "@/types/auth";

const authClient = axios.create({
  baseURL: "/api/auth",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
});

export const authService = {
  login(credentials: LoginCredentials) {
    return authClient.post<AuthResponse>("/login", credentials);
  },

  logout() {
    return authClient.post("/logout");
  },

  getSession() {
    return authClient.get<SessionResponse>("/me");
  },
};
