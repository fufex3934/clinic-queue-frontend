"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/contexts/locale-provider";
import {
  LOCALE_LABELS,
  LOCALE_ORDER,
  type Locale,
} from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";

type LocaleSelectProps = {
  className?: string;
  selectClassName?: string;
};

export function LocaleSelect({ className, selectClassName }: LocaleSelectProps) {
  const { locale, setLocale, translate } = useLocale();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Languages
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        aria-label={translate("language")}
        className={cn(
          "h-9 max-w-[11rem] rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          selectClassName,
        )}
      >
        {LOCALE_ORDER.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
