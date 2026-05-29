"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { registerUnauthorizedHandler } from "@/lib/auth/unauthorized";
import {
  clearAuthStorage,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser,
} from "@/lib/auth/token-storage";
import { getDefaultHomePath } from "@/lib/permissions";
import { authService } from "@/services/authService";
import type { AuthUser, LoginCredentials, UserRole } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      clearAuthStorage();
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, [logout]);

  const hydrateSession = useCallback(async () => {
    const cached = getStoredUser();
    if (cached) {
      setUser(cached);
    }

    try {
      const { data } = await authService.getSession();
      setUser(data.user);
      setStoredUser(data.user);
    } catch {
      setUser(null);
      clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { data } = await authService.login(credentials);
      setUser(data.user);
      setStoredUser(data.user);
      setStoredAccessToken(data.accessToken);
      router.replace(getDefaultHomePath(data.user.role));
    },
    [router],
  );

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      hasRole,
    }),
    [user, isLoading, login, logout, hasRole],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
