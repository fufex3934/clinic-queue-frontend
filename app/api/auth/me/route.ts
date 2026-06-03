import { NextRequest, NextResponse } from "next/server";
import { clearAccessTokenCookie } from "@/lib/auth/session";
import { resolveAccessToken } from "@/lib/auth/resolve-access-token";
import type { AuthUser } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET(request: NextRequest) {
  const token = await resolveAccessToken(request);

  if (!token) {
    return NextResponse.json({ user: null });
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach authentication server" },
      { status: 503 },
    );
  }

  if (!backendRes.ok) {
    const response = NextResponse.json({ user: null });
    clearAccessTokenCookie(response);
    return response;
  }

  const user = (await backendRes.json()) as AuthUser;
  return NextResponse.json({ user });
}
