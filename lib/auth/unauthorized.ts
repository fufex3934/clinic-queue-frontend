"use client";

import { clearAuthStorage } from "@/lib/auth/token-storage";

let logoutHandler: (() => void | Promise<void>) | null = null;

export function registerUnauthorizedHandler(
  handler: () => void | Promise<void>,
): void {
  logoutHandler = handler;
}

export async function handleUnauthorized(): Promise<void> {
  clearAuthStorage();
  if (logoutHandler) {
    await logoutHandler();
    return;
  }

  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("session", "expired");
  window.location.href = loginUrl.toString();
}
