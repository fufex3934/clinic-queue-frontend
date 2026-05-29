import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import type { UserRole } from "@/types/auth";

const VALID_ROLES: UserRole[] = ["admin", "receptionist", "platform_admin"];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Decode JWT payload without verification (middleware routing only). */
export function isAccessTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= Date.now();
}

export function getRoleFromAccessToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  if (typeof role === "string" && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  return null;
}

export function buildLoginRedirect(
  requestUrl: string,
  reason?: "expired" | "invalid",
): URL {
  const loginUrl = new URL("/login", requestUrl);
  if (reason) {
    loginUrl.searchParams.set("session", reason);
  }
  return loginUrl;
}

export function clearAccessTokenCookie(response: {
  cookies: { set: (name: string, value: string, options?: object) => void };
}): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
