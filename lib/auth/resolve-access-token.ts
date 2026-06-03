import type { NextRequest } from "next/server";
import { getServerAccessToken } from "@/lib/auth/server";

/** Cookie first, then `Authorization: Bearer` from the client (localStorage fallback). */
export async function resolveAccessToken(
  request?: NextRequest,
): Promise<string | undefined> {
  const fromCookie = await getServerAccessToken();
  if (fromCookie) return fromCookie;

  const header = request?.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  return undefined;
}
