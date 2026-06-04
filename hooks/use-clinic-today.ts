"use client";

import { useMemo } from "react";
import { useClinicContext } from "@/contexts/clinic-context";
import {
  formatDisplayDateInTimeZone,
  todayDateStringInTimeZone,
} from "@/lib/clinic-date";
import { DEFAULT_CLINIC_TIMEZONE } from "@/lib/clinic-display";

/** Active clinic IANA timezone (defaults to Ethiopia). */
export function useClinicTimeZone(): string {
  const { activeClinic } = useClinicContext();
  return activeClinic?.timezone?.trim() || DEFAULT_CLINIC_TIMEZONE;
}

/** Today's YYYY-MM-DD in the active clinic timezone. */
export function useClinicToday(): string {
  const timeZone = useClinicTimeZone();
  return useMemo(
    () => todayDateStringInTimeZone(timeZone),
    [timeZone],
  );
}

export function useFormatClinicDate() {
  const timeZone = useClinicTimeZone();
  return useMemo(
    () => (isoDate: string) => formatDisplayDateInTimeZone(isoDate, timeZone),
    [timeZone],
  );
}
