"use client";

import { useSessionSignal } from "./SessionProvider";

export default function AuthShell() {
  const { isAuthenticated, role, signInAs, signOut } = useSessionSignal();

  return (
    <section className="auth-access-panel">
      <section className="basic-auth-card" aria-labelledby="signin-title">
        <div>
          <p className="component-label">Sign in</p>
          <h2 id="signin-title">Welcome back</h2>
          <p>Use this placeholder form for returning clients and managers.</p>
        </div>
        <form className="form-stack">
          <label>
            Email
            <input type="email" placeholder="client@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" />
          </label>
          {isAuthenticated ? (
            <p className="auth-session-note">Demo session active as {role}. Use the navigation to continue or sign out.</p>
          ) : null}
          <div className="button-row">
            <button type="button" onClick={() => signInAs("client")}>Sign in as client</button>
            <button className="secondary-button" type="button" onClick={() => signInAs("manager")}>
              Sign in as manager
            </button>
            <button className="secondary-button" type="button" onClick={() => signInAs("admin")}>
              Admin demo
            </button>
            {isAuthenticated ? (
              <button className="danger-button" type="button" onClick={() => signOut("manual")}>Sign out</button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="basic-auth-card" id="signup" aria-labelledby="signup-title">
        <div>
          <p className="component-label">Sign up</p>
          <h2 id="signup-title">Create account</h2>
          <p>Use this placeholder form for new client or manager onboarding.</p>
        </div>
        <form className="form-stack">
          <label>
            Full name
            <input placeholder="Avery Coleman" />
          </label>
          <label>
            Email
            <input type="email" placeholder="new-client@example.com" />
          </label>
          <label>
            Account type
            <select defaultValue="client">
              <option value="client">Client</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <button type="button" onClick={() => signInAs("client")}>Create account</button>
        </form>
      </section>
    </section>
  );
}
