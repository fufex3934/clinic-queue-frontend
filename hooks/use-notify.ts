"use client";

import { useCallback, useMemo } from "react";
import { toast as sonner } from "sonner";
import { useLocale } from "@/contexts/locale-provider";
import type { MessageKey } from "@/lib/i18n/catalog/en";
import {
  notifyError as baseNotifyError,
  notifyInfo as baseNotifyInfo,
  notifySuccess as baseNotifySuccess,
  notifyWarning as baseNotifyWarning,
} from "@/lib/toast";

type Vars = Record<string, string | number>;

/**
 * Locale-aware toasts for dashboard flows.
 * API errors still surface server messages via notifyError.
 */
export function useNotify() {
  const { translate } = useLocale();

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => translate(key, vars),
    [translate],
  );

  return useMemo(
    () => ({
      success: (titleKey: MessageKey, descKey?: MessageKey, vars?: Vars) =>
        baseNotifySuccess(
          t(titleKey, vars),
          descKey ? t(descKey, vars) : undefined,
        ),
      error: (
        err: unknown,
        fallbackTitleKey: MessageKey,
        descKey?: MessageKey,
        vars?: Vars,
      ) =>
        baseNotifyError(
          err,
          t(fallbackTitleKey, vars),
          descKey ? t(descKey, vars) : undefined,
        ),
      info: (titleKey: MessageKey, descKey?: MessageKey, vars?: Vars) =>
        baseNotifyInfo(t(titleKey, vars), descKey ? t(descKey, vars) : undefined),
      warning: (titleKey: MessageKey, descKey?: MessageKey, vars?: Vars) =>
        baseNotifyWarning(
          t(titleKey, vars),
          descKey ? t(descKey, vars) : undefined,
        ),
      validation: (descKey: MessageKey, vars?: Vars) => {
        sonner.warning(t("toastValidationTitle"), {
          description: t(descKey, vars),
        });
      },
    }),
    [t],
  );
}
