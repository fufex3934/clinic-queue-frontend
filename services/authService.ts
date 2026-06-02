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

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data as
      | { statusCode?: number; message?: string | string[]; error?: string }
      | undefined;

    const rawMessage = data?.message ?? error?.message ?? "Authentication request failed";
    const message = Array.isArray(rawMessage) ? rawMessage.join(", ") : String(rawMessage);

    return Promise.reject({
      statusCode: data?.statusCode ?? status ?? 500,
      message,
      error: data?.error ?? "Error",
      timestamp: new Date().toISOString(),
    });
  },
);

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

  forgotPassword(identifier: string) {
    return authClient.post<{ message: string; resetToken?: string }>(
      "/forgot-password",
      { identifier },
    );
  },

  resetPassword(token: string, password: string) {
    return authClient.post<{ message: string }>("/reset-password", {
      token,
      password,
    });
  },
};
