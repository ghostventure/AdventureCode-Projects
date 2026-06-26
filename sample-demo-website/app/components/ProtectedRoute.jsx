"use client";

import { canAccessRoute } from "../../lib/auth-model";
import { useSessionSignal } from "./SessionProvider";

export default function ProtectedRoute({ role = "manager", route = "/manager", children }) {
  const { isTimedOut } = useSessionSignal();
  const allowed = !isTimedOut && canAccessRoute(role, route);

  if (!allowed) {
    return (
      <section className="component-card danger-card">
        <p className="component-label">Protected route</p>
        <h2>Access requires an active session</h2>
        <p>This wrapper is ready to enforce Firebase Auth sessions and role claims.</p>
      </section>
    );
  }

  return children;
}
