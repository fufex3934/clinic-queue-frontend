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
import { fetchAllPaginated } from "@/lib/fetch-all-paginated";
import { clinicService } from "@/services/clinicService";
import type { Clinic } from "@/types/clinic";

interface ClinicContextValue {
  clinics: Clinic[];
  operationalClinicId: string | null;
  setOperationalClinicId: (id: string) => void;
  /** Resolved clinic record for the active operational scope. */
  activeClinic: Clinic | null;
  loadingActiveClinic: boolean;
  isPlatformView: boolean;
  loadingClinics: boolean;
  /** Platform admin has a clinic selected for operational APIs. */
  isScopeReady: boolean;
  /** Reload tenant list after create / update / deactivate / delete. */
  refreshClinics: () => Promise<void>;
}

function pickDefaultClinicId(clinics: Clinic[]): string | null {
  const active = clinics.find((c) => c.isActive !== false);
  return active?._id ?? clinics[0]?._id ?? null;
}

function resolveStoredClinicId(clinics: Clinic[]): string | null {
  const stored = getStoredOperationalClinicId();
  if (stored && clinics.some((c) => c._id === stored)) {
    return stored;
  }
  return pickDefaultClinicId(clinics);
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [operationalClinicId, setOperationalClinicIdState] = useState<
    string | null
  >(null);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);
  const [loadingActiveClinic, setLoadingActiveClinic] = useState(false);

  const isPlatformView = user?.role === "platform_admin";

  const setOperationalClinicId = useCallback((id: string) => {
    setOperationalClinicIdState(id);
    setStoredOperationalClinicId(id);
  }, []);

  useLayoutEffect(() => {
    if (!user) {
      setOperationalClinicIdState(null);
      return;
    }
    if (!isPlatformView) {
      setOperationalClinicIdState(user.clinicId);
    }
  }, [user, isPlatformView]);

  const refreshClinics = useCallback(async () => {
    if (!user || !isPlatformView) return;
    setLoadingClinics(true);
    try {
      const items = await fetchAllPaginated((params) =>
        clinicService.list({ ...params, sortBy: "name", sortOrder: "asc" }),
      );
      setClinics(items);
      const resolved = resolveStoredClinicId(items);
      if (resolved) {
        setOperationalClinicIdState(resolved);
        setStoredOperationalClinicId(resolved);
      } else {
        clearStoredOperationalClinicId();
        setOperationalClinicIdState(null);
      }
    } catch {
      setClinics([]);
      clearStoredOperationalClinicId();
      setOperationalClinicIdState(null);
    } finally {
      setLoadingClinics(false);
    }
  }, [user, isPlatformView]);

  useEffect(() => {
    if (!user) return;
    if (isPlatformView) {
      void refreshClinics();
    } else {
      clearStoredOperationalClinicId();
      setClinics([]);
    }
  }, [user, isPlatformView, refreshClinics]);

  useEffect(() => {
    if (!user) {
      setActiveClinic(null);
      return;
    }

    if (isPlatformView) {
      if (loadingClinics) return;
      if (!operationalClinicId) {
        setActiveClinic(null);
        return;
      }
      const fromList = clinics.find((c) => c._id === operationalClinicId);
      setActiveClinic(fromList ?? null);
      if (!fromList && clinics.length > 0) {
        const fallback = pickDefaultClinicId(clinics);
        if (fallback) {
          setOperationalClinicIdState(fallback);
          setStoredOperationalClinicId(fallback);
        }
      }
      return;
    }

    setLoadingActiveClinic(true);
    void clinicService
      .getMine()
      .then(({ data }) => setActiveClinic(data))
      .catch(() => setActiveClinic(null))
      .finally(() => setLoadingActiveClinic(false));
  }, [
    user,
    operationalClinicId,
    isPlatformView,
    clinics,
    loadingClinics,
  ]);

  const isScopeReady =
    !isPlatformView ||
    (!loadingClinics && Boolean(operationalClinicId && activeClinic));

  const value = useMemo(
    () => ({
      clinics,
      operationalClinicId,
      setOperationalClinicId,
      activeClinic,
      loadingActiveClinic,
      isPlatformView,
      loadingClinics,
      isScopeReady,
      refreshClinics,
    }),
    [
      clinics,
      operationalClinicId,
      setOperationalClinicId,
      activeClinic,
      loadingActiveClinic,
      isPlatformView,
      loadingClinics,
      isScopeReady,
      refreshClinics,
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
