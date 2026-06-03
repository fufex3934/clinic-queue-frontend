import { toast as sonner } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

/** User-facing success feedback after an action completes. */
export function notifySuccess(title: string, description?: string) {
  sonner.success(title, description ? { description } : undefined);
}

/** User-facing error — prefer API message when available. */
export function notifyError(
  err: unknown,
  fallbackTitle: string,
  description?: string,
) {
  const message = getErrorMessage(err, fallbackTitle);
  sonner.error(message, description ? { description } : undefined);
}

export function notifyInfo(title: string, description?: string) {
  sonner.info(title, description ? { description } : undefined);
}

export function notifyWarning(title: string, description?: string) {
  sonner.warning(title, description ? { description } : undefined);
}

/** Inline validation before a request (no server round-trip). */
export function notifyValidation(message: string) {
  sonner.warning("Please check your input", { description: message });
}
