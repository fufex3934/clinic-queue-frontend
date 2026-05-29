import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/constants";
import type { AuthResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  let body: { identifier?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  const password = body.password;

  if (!identifier || !password) {
    return NextResponse.json(
      { message: "Identifier and password are required" },
      { status: 400 },
    );
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach authentication server" },
      { status: 503 },
    );
  }

  const payload = (await backendRes.json()) as AuthResponse & {
    message?: string | string[];
  };

  if (!backendRes.ok) {
    const raw = payload.message ?? "Login failed";
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    return NextResponse.json(
      {
        statusCode: backendRes.status,
        message,
        error: "Unauthorized",
      },
      { status: backendRes.status },
    );
  }

  const response = NextResponse.json({
    user: payload.user,
    accessToken: payload.accessToken,
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}
