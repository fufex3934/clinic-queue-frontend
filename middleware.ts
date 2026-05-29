import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";
import {
  buildLoginRedirect,
  clearAccessTokenCookie,
  getRoleFromAccessToken,
  isAccessTokenExpired,
} from "@/lib/auth/session";
import { getDefaultHomePath } from "@/lib/permissions";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isLogin = pathname === "/login";

  if (isProtected) {
    if (!token) {
      const loginUrl = buildLoginRedirect(request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAccessTokenExpired(token)) {
      const response = NextResponse.redirect(
        buildLoginRedirect(request.url, "expired"),
      );
      clearAccessTokenCookie(response);
      return response;
    }
  }

  if (isLogin && token && !isAccessTokenExpired(token)) {
    const role = getRoleFromAccessToken(token);
    const home = role ? getDefaultHomePath(role) : "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (isLogin && token && isAccessTokenExpired(token)) {
    const response = NextResponse.next();
    clearAccessTokenCookie(response);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
