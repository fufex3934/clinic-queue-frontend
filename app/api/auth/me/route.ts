import { NextResponse } from "next/server";
import { getServerAccessToken } from "@/lib/auth/server";
import type { AuthUser } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET() {
  const token = await getServerAccessToken();

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
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
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const user = (await backendRes.json()) as AuthUser;
  return NextResponse.json({ user });
}
