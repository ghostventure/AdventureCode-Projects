"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { canRoleAccessPath, getAccessPolicyForPath, isPublicPath } from "../../lib/route-access-policy";
import { useSessionSignal } from "./SessionProvider";

function AccessRequiredPanel({ route, access }) {
  return (
    <section className="route-page route-access-page" aria-labelledby="access-required-title">
      <div className="route-panel access-required-panel">
        <p className="component-label">Protected area</p>
        <h1 id="access-required-title">Sign in to continue</h1>
        <p>
          This page is reserved for {access || "authorized"} users in the demo
          template. Public visitors can use the landing page, auth page, legal
          pages, data request page, and maintenance page.
        </p>
        <div className="button-row">
          <Link className="primary-action" href={`/auth?next=${encodeURIComponent(route)}`}>
            Sign in or create account
          </Link>
          <Link className="secondary-action" href="/">
            Back to public landing
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AccessControlledContent({ route, fallback = null, children }) {
  const { isAuthReady, isAuthenticated, role } = useSessionSignal();
  const policy = getAccessPolicyForPath(route);
  const allowed = isPublicPath(route) || (isAuthenticated && canRoleAccessPath(role, route));

  if (!isAuthReady) {
    return fallback;
  }

  if (!allowed) {
    return fallback ?? <AccessRequiredPanel route={route} access={policy?.access} />;
  }

  return children;
}

export default function RouteAccessGate({ children }) {
  const pathname = usePathname() || "/";

  return (
    <AccessControlledContent route={pathname}>
      {children}
    </AccessControlledContent>
  );
}
