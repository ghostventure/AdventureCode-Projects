import {
  authAccountFeatures,
  createDeviceSession,
  createInviteAcceptance,
  createLoginHistoryEvent,
  getOnboardingChecklist,
  mapAuthError,
  mfaMethods,
  requiresRecentLogin,
  syncRoleClaims
} from "../../lib/auth-account";

export function AuthAccountOverview() {
  return (
    <section className="component-card">
      <p className="component-label">Auth/account coverage</p>
      <div className="split-list">
        {authAccountFeatures.map((feature) => (
          <span key={feature}>{feature}</span>
        ))}
      </div>
    </section>
  );
}

export function EmailVerificationPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Email verification</p>
      <h2>Verification gate ready</h2>
      <p>Use before sensitive account, portal, export, and manager-only workflows.</p>
    </section>
  );
}

export function PasswordChangePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Password change</p>
      <form className="form-stack">
        <label>
          Current password
          <input type="password" placeholder="Current password" />
        </label>
        <label>
          New password
          <input type="password" placeholder="New password" />
        </label>
        <button type="button">Preview change</button>
      </form>
    </section>
  );
}

export function MfaPasskeyPanel() {
  return (
    <section className="component-card">
      <p className="component-label">MFA/passkey placeholders</p>
      <div className="split-list">
        {mfaMethods.map((method) => (
          <span key={method.key}>{method.label}: {method.status}</span>
        ))}
      </div>
    </section>
  );
}

export function DeviceSessionPanel() {
  const session = createDeviceSession({ uid: "preview-user", trusted: true });

  return (
    <section className="component-card">
      <p className="component-label">Device sessions</p>
      <h2>{session.status}</h2>
      <p>Session and device records are ready for revoke-current and revoke-other-device controls.</p>
    </section>
  );
}

export function LoginHistoryPanel() {
  const event = createLoginHistoryEvent({ uid: "preview-user", userAgent: "Template browser" });

  return (
    <section className="component-card">
      <p className="component-label">Login history</p>
      <div className="split-list">
        <span>Method: {event.method}</span>
        <span>IP: {event.ip}</span>
        <span>User agent: {event.userAgent}</span>
      </div>
    </section>
  );
}

export function ClaimsSyncPanel() {
  const sync = syncRoleClaims({
    uid: "manager-preview",
    role: "manager",
    status: "active",
    managerScope: ["users", "audit"]
  });

  return (
    <section className="component-card">
      <p className="component-label">Custom claims sync</p>
      <h2>{sync.claims.role}</h2>
      <p>Firestore role records can be mirrored into Firebase custom claims by server-side code.</p>
    </section>
  );
}

export function InviteAcceptancePanel() {
  const invite = createInviteAcceptance({
    invitationId: "invite-preview",
    email: "new-client@example.com",
    displayName: "New Client"
  });

  return (
    <section className="component-card">
      <p className="component-label">Invite acceptance</p>
      <h2>{invite.status}</h2>
      <p>Accept-invite flow is staged for set-password and profile completion screens.</p>
    </section>
  );
}

export function OnboardingChecklistPanel() {
  const checklist = getOnboardingChecklist("client");

  return (
    <section className="component-card">
      <p className="component-label">Onboarding checklist</p>
      <div className="split-list">
        {checklist.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}

export function ReauthGatePanel() {
  return (
    <section className="component-card warning-card">
      <p className="component-label">Recent-login gate</p>
      <h2>{requiresRecentLogin("change-password") ? "Required" : "Open"}</h2>
      <p>Reusable gate for password changes, role changes, exports, deletes, and MFA changes.</p>
    </section>
  );
}

export function AuthErrorMapperPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Auth error mapper</p>
      <h2>User-safe messages</h2>
      <p>{mapAuthError("auth/too-many-requests")}</p>
    </section>
  );
}
