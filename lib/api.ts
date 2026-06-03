import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { handleUnauthorized } from "@/lib/auth/unauthorized";
import { getStoredAccessToken } from "@/lib/auth/token-storage";

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  error: string;
  timestamp?: string;
  path?: string;
}

const api = axios.create({
  baseURL: "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      await handleUnauthorized();
      return Promise.reject(error);
    }

    const data = error.response?.data;
    const message =
      data?.message ?? error.message ?? "An unexpected error occurred";

    if (process.env.NODE_ENV === "development") {
      console.error("[API]", error.config?.url, message);
    }

    return Promise.reject(
      data ?? {
        statusCode: status ?? 500,
        message,
        error: "Error",
      },
    );
  },
);

export default api;
