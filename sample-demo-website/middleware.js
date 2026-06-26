import { NextResponse } from "next/server";
import {
  createTraceHeaders,
  getSuspiciousSearchKeys,
  isGuardedPath,
  isSuspiciousPathname
} from "./lib/template-hardening.mjs";
import { canRoleAccessPath, getAccessPolicyForPath, isPublicPath } from "./lib/route-access-policy";

function getDemoRole(request) {
  const headerRole = request.headers.get("x-demo-auth-role");
  const cookieRole = request.cookies.get("sample-demo-role")?.value;
  const role = headerRole || cookieRole;

  return ["client", "manager", "admin", "system"].includes(role) ? role : null;
}

function isApiPath(pathname) {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const requestId = crypto.randomUUID();
  const suspiciousKeys = getSuspiciousSearchKeys(searchParams);
  const policy = getAccessPolicyForPath(pathname);
  const role = getDemoRole(request);

  if (isSuspiciousPathname(pathname) || suspiciousKeys.length > 0) {
    const response = NextResponse.json(
      {
        ok: false,
        status: "blocked",
        reason: "tamper-resistant request guard rejected the preview request"
      },
      { status: 400 }
    );

    for (const [key, value] of createTraceHeaders(pathname, requestId)) {
      response.headers.set(key, value);
    }

    response.headers.set("cache-control", "no-store, max-age=0");
    return response;
  }

  if (!isPublicPath(pathname) && !canRoleAccessPath(role, pathname)) {
    if (isApiPath(pathname)) {
      const response = NextResponse.json(
        {
          ok: false,
          status: "unauthorized",
          requiredAccess: policy?.access || "authenticated"
        },
        { status: 401 }
      );

      for (const [key, value] of createTraceHeaders(pathname, requestId)) {
        response.headers.set(key, value);
      }

      response.headers.set("cache-control", "no-store, max-age=0");
      return response;
    }

    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth";
    signInUrl.search = `?next=${encodeURIComponent(pathname)}`;

    const response = NextResponse.redirect(signInUrl, 307);

    for (const [key, value] of createTraceHeaders(pathname, requestId)) {
      response.headers.set(key, value);
    }

    response.headers.set("cache-control", "no-store, max-age=0");
    return response;
  }

  const response = NextResponse.next();

  if (isGuardedPath(pathname)) {
    for (const [key, value] of createTraceHeaders(pathname, requestId)) {
      response.headers.set(key, value);
    }

    response.headers.set("cache-control", "no-store, max-age=0");
  }

  response.headers.set("x-sample-demo-path", pathname);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/client/:path*",
    "/communication/:path*",
    "/data-workflow/:path*",
    "/health/:path*",
    "/manager/:path*",
    "/operations/:path*",
    "/operations-quality/:path*",
    "/platform/:path*",
    "/security/:path*",
    "/users/:path*"
  ]
};
