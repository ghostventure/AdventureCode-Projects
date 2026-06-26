import { auditEvents } from "../../lib/component-data";
import {
  dexterityOptimizationControls,
  tamperResistanceControls
} from "../../lib/template-hardening.mjs";

export function AccountStatusControls() {
  return (
    <section className="component-card">
      <p className="component-label">Account status controls</p>
      <div className="button-row">
        <button type="button">Activate</button>
        <button className="secondary-button" type="button">Pause</button>
        <button className="danger-button" type="button">Archive</button>
      </div>
    </section>
  );
}

export function InviteUserFlow() {
  return (
    <section className="component-card">
      <p className="component-label">Invite user flow</p>
      <div className="form-stack">
        <label>
          Email
          <input placeholder="new-user@example.com" />
        </label>
        <label>
          Role
          <select defaultValue="client">
            <option value="client">Client</option>
            <option value="manager">Manager</option>
          </select>
        </label>
      </div>
    </section>
  );
}

export function AuditLogViewer() {
  return (
    <section className="component-card">
      <p className="component-label">Audit log</p>
      <div className="split-list">
        {auditEvents.map((event) => (
          <span key={event.label}>{event.label}: {event.status}</span>
        ))}
      </div>
    </section>
  );
}

export function RuleStatusPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Rule status</p>
      <h2>Rules compile</h2>
      <p>Firestore rules passed the latest Firebase CLI dry-run compilation.</p>
    </section>
  );
}

export function SessionTimeoutWarning() {
  return (
    <section className="component-card warning-card">
      <p className="component-label">Session timeout</p>
      <h2>10 minute idle sign-out</h2>
      <p>Global session signal resets on activity and broadcasts sign-out across open tabs.</p>
    </section>
  );
}

export function SensitiveActionConfirm() {
  return (
    <section className="component-card danger-card">
      <p className="component-label">Sensitive action</p>
      <h2>Confirm before continuing</h2>
      <p>Reusable confirmation for deletes, role changes, and access lockouts.</p>
    </section>
  );
}

export function TamperResistancePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Tamper resistance</p>
      <h2>Request and UI guardrails</h2>
      <p>Shared controls for hardening template mode without enabling billing or provider APIs.</p>
      <div className="split-list">
        {tamperResistanceControls.map((control) => (
          <span key={control.label}>
            <strong>{control.label}</strong>
            {control.value}
          </span>
        ))}
      </div>
    </section>
  );
}

export function DexterityOptimizationPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Dexterity optimization</p>
      <h2>Fast to operate, fast to rebrand</h2>
      <p>Template affordances that keep customer customization quick and low-friction.</p>
      <div className="split-list">
        {dexterityOptimizationControls.map((control) => (
          <span key={control.label}>
            <strong>{control.label}</strong>
            {control.value}
          </span>
        ))}
      </div>
    </section>
  );
}
