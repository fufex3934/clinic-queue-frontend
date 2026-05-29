"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-provider";
import {
  clearStoredOperationalClinicId,
  getStoredOperationalClinicId,
  setStoredOperationalClinicId,
} from "@/lib/clinic-scope";
import { clinicService } from "@/services/clinicService";
import type { Clinic } from "@/types/clinic";

interface ClinicContextValue {
  clinics: Clinic[];
  operationalClinicId: string | null;
  setOperationalClinicId: (id: string) => void;
  isPlatformView: boolean;
  loadingClinics: boolean;
  /** Platform admin has a clinic selected for operational APIs. */
  isScopeReady: boolean;
}

function resolveOperationalClinicId(
  user: { clinicId: string } | null,
  isPlatformView: boolean,
): string | null {
  if (!user) return null;
  if (isPlatformView) {
    return getStoredOperationalClinicId() ?? user.clinicId ?? null;
  }
  return user.clinicId;
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [operationalClinicId, setOperationalClinicIdState] = useState<
    string | null
  >(null);
  const [loadingClinics, setLoadingClinics] = useState(false);

  const isPlatformView = user?.role === "platform_admin";

  const setOperationalClinicId = useCallback((id: string) => {
    setOperationalClinicIdState(id);
    setStoredOperationalClinicId(id);
  }, []);

  // Sync clinic id before child effects run (avoids platform admin 400 on queue load).
  useLayoutEffect(() => {
    setOperationalClinicIdState(resolveOperationalClinicId(user, isPlatformView));
  }, [user, isPlatformView]);

  useEffect(() => {
    if (!user) return;

    if (isPlatformView) {
      setLoadingClinics(true);
      void clinicService
        .list()
        .then(({ data }) => {
          setClinics(data);
          const current = resolveOperationalClinicId(user, true);
          if (current) return;
          const firstActive = data.find((c) => c.isActive !== false) ?? data[0];
          if (firstActive) {
            setOperationalClinicIdState(firstActive._id);
            setStoredOperationalClinicId(firstActive._id);
          }
        })
        .catch(() => setClinics([]))
        .finally(() => setLoadingClinics(false));
    } else {
      clearStoredOperationalClinicId();
    }
  }, [user, isPlatformView]);

  const isScopeReady = !isPlatformView || Boolean(operationalClinicId);

  const value = useMemo(
    () => ({
      clinics,
      operationalClinicId,
      setOperationalClinicId,
      isPlatformView,
      loadingClinics,
      isScopeReady,
    }),
    [
      clinics,
      operationalClinicId,
      setOperationalClinicId,
      isPlatformView,
      loadingClinics,
      isScopeReady,
    ],
  );

  return (
    <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
  );
}

export function useClinicContext(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) {
    throw new Error("useClinicContext must be used within ClinicProvider");
  }
  return ctx;
}
