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
import type { MessageKey } from "@/lib/i18n/catalog/en";
import {
  t,
  type Locale,
  LOCALE_LABELS,
  nextLocale,
  parseStoredLocale,
} from "@/lib/i18n/messages";

const STORAGE_KEY = "clinic-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** English → Amharic → Afaan Oromoo → English */
  toggleLocale: () => void;
  translate: (
    key: MessageKey,
    vars?: Record<string, string | number>,
  ) => string;
  localeLabel: string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return parseStoredLocale(localStorage.getItem(STORAGE_KEY));
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(nextLocale(locale));
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      translate: (key, vars) => t(locale, key, vars),
      localeLabel: LOCALE_LABELS[locale],
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
