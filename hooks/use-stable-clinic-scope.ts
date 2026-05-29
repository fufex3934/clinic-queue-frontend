"use client";

import { useMemo } from "react";
import type { UserRole } from "@/types/auth";

const EMPTY_SCOPE = Object.freeze({}) as { clinicId?: string };

/** Stable reference — avoids infinite refetch when passed as hook dependency. */
export function useStableClinicScope(
  role: UserRole | undefined,
  operationalClinicId: string | null,
): { clinicId?: string } {
  return useMemo(() => {
    if (role === "platform_admin" && operationalClinicId) {
      return { clinicId: operationalClinicId };
    }
    return EMPTY_SCOPE;
  }, [role, operationalClinicId]);
}

export function clinicScopeQueryKey(scope: { clinicId?: string }): string {
  return scope.clinicId ?? "";
}
