import { createExportManifest, exportCollections } from "../../lib/backup-export";
import { sampleContentBlocks } from "../../lib/content-model";
import { consentCategories, legalBoilerplate } from "../../lib/consent-policy";
import { emailTemplates } from "../../lib/email-adapter";
import { validateEnvironmentContract } from "../../lib/env";
import { defaultFeatureFlags, resolveFeatureFlags } from "../../lib/feature-flags";
import { getActiveGuiTemplate, guiTemplateRegistry } from "../../lib/gui-template-registry";
import { createInvitation } from "../../lib/invitation-flow";
import { getMaintenanceState } from "../../lib/maintenance-mode";
import { checkMemoryRateLimit, createRateLimitKey } from "../../lib/rate-limit";
import { createFaqSchema, createLocalBusinessSchema } from "../../lib/seo";
import { createSessionAuditEvent } from "../../lib/session-audit";

export function FeatureFlagPanel() {
  const flags = resolveFeatureFlags();

  return (
    <section className="component-card">
      <p className="component-label">Feature flags</p>
      <div className="split-list">
        {Object.keys(defaultFeatureFlags).map((flag) => (
          <span key={flag}>{flag}: {flags[flag] ? "on" : "off"}</span>
        ))}
      </div>
    </section>
  );
}

export function RateLimitPanel() {
  const preview = checkMemoryRateLimit(createRateLimitKey(["preview", "contact-form"]), { limit: 20 });

  return (
    <section className="component-card">
      <p className="component-label">Rate limit helper</p>
      <h2>{preview.remaining} preview calls left</h2>
      <p>Reusable API route throttling contract. Swap to Redis or Firestore counters for production scale.</p>
    </section>
  );
}

export function ConsentPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Consent categories</p>
      <div className="split-list">
        {consentCategories.map((category) => (
          <span key={category.key}>{category.label}: {category.required ? "required" : "optional"}</span>
        ))}
      </div>
    </section>
  );
}

export function EmailAdapterPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Email adapter</p>
      <div className="split-list">
        {Object.entries(emailTemplates).map(([key, template]) => (
          <span key={key}>{template.subject}</span>
        ))}
      </div>
    </section>
  );
}

export function ContentModelPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Content model</p>
      <div className="split-list">
        {sampleContentBlocks.map((block) => (
          <span key={block.id}>{block.label}: {block.status}</span>
        ))}
      </div>
    </section>
  );
}

export function SeoSchemaPanel() {
  const businessSchema = createLocalBusinessSchema({ name: "Future Site", url: "https://example.com" });
  const faqSchema = createFaqSchema([{ question: "Is this reusable?", answer: "Yes." }]);

  return (
    <section className="component-card">
      <p className="component-label">SEO schema</p>
      <div className="split-list">
        <span>{businessSchema["@type"]} schema helper</span>
        <span>{faqSchema["@type"]} schema helper</span>
      </div>
    </section>
  );
}

export function BackupExportPanel() {
  const manifest = createExportManifest();

  return (
    <section className="component-card">
      <p className="component-label">Backup exports</p>
      <h2>{manifest.format}</h2>
      <p>{exportCollections.length} default collections are registered for admin export workflows.</p>
    </section>
  );
}

export function MaintenancePanel() {
  const state = getMaintenanceState();

  return (
    <section className="component-card">
      <p className="component-label">Maintenance mode</p>
      <h2>{state.enabled ? "Enabled" : "Ready"}</h2>
      <p>{state.message}</p>
    </section>
  );
}

export function InvitationPanel() {
  const result = createInvitation({ email: "client@example.com", role: "client" });

  return (
    <section className="component-card">
      <p className="component-label">Role invites</p>
      <h2>{result.ok ? "Valid invite" : "Needs review"}</h2>
      <p>Invitation records include role, sender, pending state, and expiration timestamp.</p>
    </section>
  );
}

export function SessionAuditPanel() {
  const event = createSessionAuditEvent({ action: "idle sign-out" });

  return (
    <section className="component-card">
      <p className="component-label">Session audit</p>
      <h2>{event.status}</h2>
      <p>Session lifecycle events can be written to the audit log when Firebase Auth is connected.</p>
    </section>
  );
}

export function EnvironmentContractPanel() {
  const contract = validateEnvironmentContract();

  return (
    <section className="component-card">
      <p className="component-label">Environment validator</p>
      <h2>{contract.ok ? "Ready" : `${contract.missing.length} missing`}</h2>
      <p>Required Firebase public keys are checked with a typed Zod contract.</p>
    </section>
  );
}

export function LegalSummaryPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Legal boilerplate</p>
      <h2>{legalBoilerplate.privacyUpdated}</h2>
      <p>Privacy, terms, and data request routes are installed for future site customization.</p>
    </section>
  );
}

export function GuiTemplatePanel() {
  const activeTemplate = getActiveGuiTemplate();

  return (
    <section className="component-card">
      <p className="component-label">Plug n play GUI</p>
      <h2>{activeTemplate.name}</h2>
      <p>{activeTemplate.sourceFolder}</p>
      <div className="split-list">
        <span><strong>Status</strong>{activeTemplate.status}</span>
        <span><strong>Mode</strong>{activeTemplate.mode}</span>
        <span><strong>Provider status</strong>{activeTemplate.providerStatus}</span>
        <span><strong>Installed skins</strong>{guiTemplateRegistry.length}</span>
      </div>
    </section>
  );
}
