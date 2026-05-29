"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-provider";
import {
  canAccessPath,
  getDefaultHomePath,
} from "@/lib/permissions";

/**
 * Redirects when the current URL is not allowed for the signed-in user's role.
 */
export function RoleRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !user) return;

    if (!canAccessPath(user.role, pathname)) {
      router.replace(getDefaultHomePath(user.role));
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user) {
    return null;
  }

  if (!canAccessPath(user.role, pathname)) {
    return null;
  }

  return <>{children}</>;
}
