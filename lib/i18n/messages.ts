import { am } from "./catalog/am";
import { en, type MessageKey } from "./catalog/en";
import { om } from "./catalog/om";

export type { MessageKey } from "./catalog/en";
export type Locale = "en" | "am" | "om";

export const LOCALE_ORDER: readonly Locale[] = ["en", "am", "om"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
};

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { en, am, om };

export function isEthiopicLocale(locale: Locale): boolean {
  return locale === "am";
}

export function nextLocale(current: Locale): Locale {
  const i = LOCALE_ORDER.indexOf(current);
  return LOCALE_ORDER[(i + 1) % LOCALE_ORDER.length] ?? "en";
}

export function parseStoredLocale(value: string | null): Locale {
  if (value === "am" || value === "om") return value;
  return "en";
}

/** Replace `{name}`-style placeholders in translated strings. */
export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(vars[key] ?? ""),
  );
}

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return formatMessage(MESSAGES[locale][key], vars);
}
