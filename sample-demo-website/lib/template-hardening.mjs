export const contentSecurityPolicyDirectives = Object.freeze([
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
]);

export const securityHeaders = Object.freeze([
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicyDirectives.join("; ")
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin"
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin"
  },
  {
    key: "Origin-Agent-Cluster",
    value: "?1"
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), interest-cohort=()"
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "off"
  },
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none"
  }
]);

export const immutableAssetHeaders = Object.freeze([
  {
    key: "Cache-Control",
    value: "public, max-age=31536000, immutable"
  }
]);

export const noStoreHeaders = Object.freeze([
  {
    key: "Cache-Control",
    value: "no-store, max-age=0"
  }
]);

export const guardedRoutePrefixes = Object.freeze([
  "/admin",
  "/api",
  "/client",
  "/manager",
  "/operations",
  "/platform",
  "/security",
  "/users"
]);

const blockedQueryKeys = Object.freeze([
  "__proto__",
  "constructor",
  "prototype",
  "debug",
  "token",
  "access_token",
  "id_token",
  "refresh_token"
]);

export function isGuardedPath(pathname) {
  return guardedRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isSuspiciousPathname(pathname) {
  const decodedPathname = decodeURIComponent(pathname);
  return decodedPathname.includes("..") || decodedPathname.includes("\\") || decodedPathname.includes("//");
}

export function getSuspiciousSearchKeys(searchParams) {
  return blockedQueryKeys.filter((key) => searchParams.has(key));
}

export function createTraceHeaders(pathname, requestId) {
  return [
    ["x-template-mode", "provider-free-static-ready"],
    ["x-template-route", pathname],
    ["x-request-id", requestId]
  ];
}

export const tamperResistanceControls = Object.freeze([
  {
    label: "Header contract",
    value: "Centralized CSP, frame blocking, content sniffing, resource policy, and permissions policy"
  },
  {
    label: "Route guard signal",
    value: "Workspace and API routes get request IDs plus provider-free template mode headers"
  },
  {
    label: "Input tamper filter",
    value: "Path traversal and sensitive/debug query keys are rejected before page rendering"
  },
  {
    label: "Cache boundary",
    value: "Workspace routes and placeholder API responses are no-store; static assets stay immutable"
  }
]);

export const dexterityOptimizationControls = Object.freeze([
  {
    label: "Swap-ready UI",
    value: "Client brand, copy, modules, and service labels remain isolated from provider wiring"
  },
  {
    label: "Fast operator routes",
    value: "Client, manager, admin, platform, health, and security surfaces stay directly reachable"
  },
  {
    label: "Provider-free demos",
    value: "Billing, email, SMS, analytics, and webhooks stay disabled until a leased client needs them"
  },
  {
    label: "Verification path",
    value: "Lint, audit, rules tests, build, smoke, a11y, and static deploy checks are documented"
  }
]);

