"use client";

import { useAuth } from "@/contexts/auth-provider";
import type { UserRole } from "@/types/auth";

interface RoleGateProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** Renders children only when the signed-in user has one of the allowed roles. */
export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { hasRole, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!hasRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
