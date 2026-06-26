"use client";

import { useSessionSignal } from "../../app/components/SessionProvider";

export default function ProtectedRoute({ allowed = true, children }) {
  const { isTimedOut } = useSessionSignal();

  if (isTimedOut || !allowed) {
    return (
      <section className="component-card danger-card">
        <p className="component-label">Access required</p>
        <h2>Sign in to continue</h2>
        <p>This route is ready to connect to Firebase Auth and role claims.</p>
      </section>
    );
  }

  return children;
}
