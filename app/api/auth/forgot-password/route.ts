import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  let body: { identifier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const identifier = body.identifier?.trim();
  if (!identifier) {
    return NextResponse.json(
      { message: "Identifier is required" },
      { status: 400 },
    );
  }

  try {
    const backendRes = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const payload = await backendRes.json();
    return NextResponse.json(payload, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach authentication server" },
      { status: 503 },
    );
  }
}
