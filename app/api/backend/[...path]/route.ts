import { NextRequest, NextResponse } from "next/server";
import { resolveAccessToken } from "@/lib/auth/resolve-access-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const token = await resolveAccessToken(request);

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const path = pathSegments.join("/");
  const targetUrl = new URL(path, `${API_URL.replace(/\/$/, "")}/`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  headers.set("Authorization", `Bearer ${token}`);

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach API server" },
      { status: 503 },
    );
  }

  const responseBody = await backendRes.text();
  const responseHeaders = new Headers();
  const backendContentType = backendRes.headers.get("content-type");
  if (backendContentType) {
    responseHeaders.set("Content-Type", backendContentType);
  }

  return new NextResponse(responseBody, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
