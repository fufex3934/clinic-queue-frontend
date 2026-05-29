"use client";

import { useAuth } from "@/contexts/auth-provider";
import { useClinicContext } from "@/contexts/clinic-context";
import {
  clinicScopeQueryKey,
  useStableClinicScope,
} from "@/hooks/use-stable-clinic-scope";

export function useOperationalScope() {
  const { user } = useAuth();
  const { operationalClinicId, isPlatformView, isScopeReady } = useClinicContext();
  const scope = useStableClinicScope(user?.role, operationalClinicId);
  const scopeKey = clinicScopeQueryKey(scope);

  return {
    scope,
    scopeKey,
    operationalClinicId,
    isPlatformView,
    isScopeReady,
    isAdmin: user?.role === "admin" || user?.role === "platform_admin",
  };
}
