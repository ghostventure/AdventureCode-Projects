import {
  archiveHistoryItems,
  clientDashboardSummary,
  clientLeasePresets,
  componentInventoryGroups,
  componentMetadataItems,
  dataRetentionControls,
  deploymentStatusItems,
  demoJourneySteps,
  emptyStateVariants,
  errorRecoveryVariants,
  formStateVariants,
  helpFaqItems,
  leaseSetupChecklist,
  legalReviewItems,
  loadingVariantItems,
  managerCommandSummary,
  mediaGalleryItems,
  mobilePreviewItems,
  mobileNavigationStates,
  moduleMatrixItems,
  onboardingSteps,
  printExportPreviewItems,
  quoteReviewItems,
  roleEmptyStates,
  seedScenarios,
  servicePackages,
  supportTicketItems,
  templateComparisonItems,
  tenantBrandSettings,
  themePresetSwatches,
  walkthroughSteps
} from "../../lib/component-data";

function SimpleListPanel({ label, title, description, items }) {
  return (
    <section className="component-card">
      <p className="component-label">{label}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="split-list">
        {items.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.value || item.detail}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ComponentMetadataPanel() {
  return (
    <SimpleListPanel
      label="Component metadata"
      title="Panel intent"
      description="Short internal notes for what each installed panel is meant to prove in a demo."
      items={componentMetadataItems}
    />
  );
}

export function ComponentInventoryPanel() {
  return (
    <SimpleListPanel
      label="Component inventory"
      title="Installed categories"
      description="One compact inventory view for the reusable component families."
      items={componentInventoryGroups}
    />
  );
}

export function ClientLeasePresetPanel() {
  return (
    <SimpleListPanel
      label="Lease presets"
      title="Reusable scenarios"
      description="Example client categories that can lease the same portal structure."
      items={clientLeasePresets}
    />
  );
}

export function ThemePresetSwatchesPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Theme presets</p>
      <h2>Brand swatches</h2>
      <p>Visual palette placeholders for future leased clients.</p>
      <div className="theme-swatch-grid">
        {themePresetSwatches.map((theme) => (
          <article key={theme.label}>
            <strong>{theme.label}</strong>
            <span>
              {theme.colors.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RoleEmptyStatesPanel() {
  return (
    <SimpleListPanel
      label="Role empty states"
      title="Blank screens by role"
      description="Specific first-use states for clients, managers, and admins."
      items={roleEmptyStates}
    />
  );
}

export function PrintExportPreviewPanel() {
  return (
    <SimpleListPanel
      label="Print/export preview"
      title="Document outputs"
      description="Visual print and download states without generating real PDFs."
      items={printExportPreviewItems}
    />
  );
}

export function ArchiveHistoryPanel() {
  return (
    <SimpleListPanel
      label="Archive history"
      title="Closed records"
      description="Resolved tickets, closed requests, and old documents remain easy to inspect."
      items={archiveHistoryItems}
    />
  );
}

export function HelpFaqPanel() {
  return (
    <SimpleListPanel
      label="Help and FAQ"
      title="Client help"
      description="Reusable help content before a real knowledge base is added."
      items={helpFaqItems}
    />
  );
}

export function LegalReviewStatusPanel() {
  return (
    <SimpleListPanel
      label="Legal review"
      title="Policy status"
      description="Shows which legal pages are placeholder, ready, or client-review required."
      items={legalReviewItems}
    />
  );
}

export function DataRetentionControlsPanel() {
  return (
    <SimpleListPanel
      label="Data retention"
      title="Retention controls"
      description="Nontechnical visibility into archive, delete, and export policy placeholders."
      items={dataRetentionControls}
    />
  );
}

export function TemplateComparisonPanel() {
  return (
    <SimpleListPanel
      label="Mode comparison"
      title="Template vs leased"
      description="Clear comparison of template mode, leased mode, and deeper customization."
      items={templateComparisonItems}
    />
  );
}

export function DemoWalkthroughControlsPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Demo walkthrough</p>
      <h2>Sales narrative controls</h2>
      <p>Previous and next controls for moving through the template story.</p>
      <div className="pipeline pipeline-stacked">
        {walkthroughSteps.map((step) => (
          <span key={step.label}>
            <strong>{step.label}</strong>
            {step.detail}
          </span>
        ))}
      </div>
      <div className="button-row">
        <button className="secondary-button" type="button">Previous</button>
        <button type="button">Next</button>
      </div>
    </section>
  );
}

export function LoadingVariantPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Loading variants</p>
      <h2>Module shimmers</h2>
      <p>Skeleton variants for cards, queues, tables, and messages.</p>
      <div className="split-list">
        {loadingVariantItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.detail}
            <em className="inline-skeleton" />
          </span>
        ))}
      </div>
    </section>
  );
}

export function MobileNavigationStatePanel() {
  return (
    <SimpleListPanel
      label="Mobile navigation"
      title="Compact nav states"
      description="Mobile menu and action tray placeholders for narrow screens."
      items={mobileNavigationStates}
    />
  );
}

export function ErrorRecoveryPanel() {
  return (
    <SimpleListPanel
      label="Error recovery"
      title="Recoverable states"
      description="User-safe recovery states for sessions, uploads, providers, and permissions."
      items={errorRecoveryVariants}
    />
  );
}

export function ClientDashboardSummaryPanel() {
  return (
    <section className="component-card wide-card">
      <p className="component-label">Client dashboard summary</p>
      <h2>Today in the portal</h2>
      <p>A top-level client overview for next action, upcoming activity, and recent changes.</p>
      <div className="dashboard-stats compact-dashboard-stats">
        {clientDashboardSummary.map((item) => (
          <article className="dashboard-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ManagerCommandCenterPanel() {
  return (
    <section className="component-card wide-card">
      <p className="component-label">Manager command center</p>
      <h2>Daily operating view</h2>
      <p>One summary panel tying intake, approvals, support, and schedule into a manager handoff.</p>
      <div className="dashboard-stats compact-dashboard-stats">
        {managerCommandSummary.map((item) => (
          <article className="dashboard-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ServiceCatalogPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Service catalog</p>
      <h2>Client-specific offers</h2>
      <p>Reusable service cards can be renamed and reordered for the leasing client.</p>
      <div className="split-list">
        {servicePackages.map((item) => (
          <span key={item.name}>
            <strong>{item.name}</strong>
            {item.cadence}
            <small>{item.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function ServicePackagePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Service package detail</p>
      <h2>{servicePackages[1].name}</h2>
      <p>{servicePackages[1].detail}</p>
      <div className="button-row">
        <button type="button">Preview request</button>
        <button className="secondary-button" type="button">Compare options</button>
      </div>
    </section>
  );
}

export function QuoteReviewPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Quote review</p>
      <h2>Approval preview</h2>
      <p>Visual scope review and acknowledgement flow without a billing system.</p>
      <div className="split-list">
        {quoteReviewItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.value}
            <small>{item.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function ProjectDetailPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Project detail</p>
      <h2>Request #1042</h2>
      <p>Focused status card for one client request, assigned manager, next action, files, and timeline.</p>
      <div className="detail-grid">
        <span><strong>Review</strong> Current state</span>
        <span><strong>Avery</strong> Client</span>
        <span><strong>Manager</strong> Owner</span>
      </div>
      <div className="button-row">
        <button type="button">Open project</button>
        <button className="secondary-button" type="button">Stage update</button>
      </div>
    </section>
  );
}

export function ClientOnboardingWizardPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Onboarding wizard</p>
      <h2>5-step setup</h2>
      <p>Client setup flow for profile, property, contacts, documents, and first request.</p>
      <div className="pipeline pipeline-stacked">
        {onboardingSteps.map((step, index) => (
          <span key={step.label}>
            <strong>{index + 1}</strong>
            {step.label}
            <small>{step.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function TenantCustomizationPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Tenant customization</p>
      <h2>Lease-ready settings</h2>
      <p>Visual controls for adapting the same template to each client's brand and service language.</p>
      <div className="split-list">
        {tenantBrandSettings.map((setting) => (
          <span key={setting.label}>
            <strong>{setting.label}</strong>
            {setting.value}
          </span>
        ))}
      </div>
    </section>
  );
}

export function LeaseSetupChecklistPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Lease setup checklist</p>
      <h2>Launch readiness</h2>
      <p>Internal setup tracker for converting the template into a leased client portal.</p>
      <div className="split-list">
        {leaseSetupChecklist.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.status}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ModuleEnableMatrixPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Module matrix</p>
      <h2>Enabled surfaces</h2>
      <p>Visual toggles for what each leased client receives by default.</p>
      <div className="split-list">
        {moduleMatrixItems.map((item) => (
          <span key={item.label}>
            <strong>{item.enabled ? "On" : "Off"}</strong>
            {item.label}
            <small>{item.enabled ? "Included in demo" : "Provider or billing gated"}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function DocumentSignaturePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Document agreement</p>
      <h2>Signature placeholder</h2>
      <p>Shows accepted, pending, and needs-review agreement states without connecting an e-sign provider.</p>
      <div className="segmented-control" aria-label="Agreement states">
        <span className="segment-active"><strong>Accepted</strong><small>Client terms</small></span>
        <span><strong>Pending</strong><small>Manager packet</small></span>
        <span><strong>Review</strong><small>Custom clause</small></span>
      </div>
    </section>
  );
}

export function SupportTicketPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Support ticket</p>
      <h2>Open request</h2>
      <p>Reusable client support surface for account, scheduling, document, and service questions.</p>
      <div className="split-list">
        {supportTicketItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.value}
          </span>
        ))}
      </div>
    </section>
  );
}

export function MediaGalleryPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Media gallery</p>
      <h2>Upload review</h2>
      <p>Photo and gallery placeholders for client-visible media, internal review, and manager notes.</p>
      <div className="split-list">
        {mediaGalleryItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.type}
            <small>{item.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function NotificationPreferencesPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Notification preferences</p>
      <h2>Visual controls only</h2>
      <p>Email, SMS, and portal preferences are visible without connecting provider APIs.</p>
      <div className="segmented-control" aria-label="Notification channels">
        <span className="segment-active"><strong>Portal</strong><small>Enabled</small></span>
        <span><strong>Email</strong><small>Provider pending</small></span>
        <span><strong>SMS</strong><small>Provider pending</small></span>
      </div>
    </section>
  );
}

export function FormStateVariantsPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Form states</p>
      <h2>Submission feedback</h2>
      <p>Reusable success, draft, validation, and blocked states for placeholder forms.</p>
      <div className="split-list">
        {formStateVariants.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.detail}
            <small>{item.tone}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function EmptyStateVariantsPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Empty states</p>
      <h2>First-use screens</h2>
      <p>Reusable blank states for new accounts that do not have data yet.</p>
      <div className="split-list">
        {emptyStateVariants.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.detail}
          </span>
        ))}
      </div>
    </section>
  );
}

export function MobilePreviewPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Mobile previews</p>
      <h2>Compact components</h2>
      <p>Mobile-first component states for dashboard cards, queues, onboarding, and action trays.</p>
      <div className="mobile-preview-stack">
        {mobilePreviewItems.map((item) => (
          <article key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DemoSeedSwitcherPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Demo seed switcher</p>
      <h2>Scenario presets</h2>
      <p>Visual selector for switching the template story between common client and manager states.</p>
      <div className="segmented-control" aria-label="Demo seed scenarios">
        {seedScenarios.map((scenario, index) => (
          <span className={index === 1 ? "segment-active" : ""} key={scenario.label}>
            <strong>{scenario.label}</strong>
            <small>{scenario.detail}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function DeploymentStatusPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Deployment status</p>
      <h2>Runtime visibility</h2>
      <p>Operational status panel for local, build, and live demo readiness.</p>
      <div className="split-list">
        {deploymentStatusItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}: {item.value}</strong>
            {item.detail}
          </span>
        ))}
      </div>
    </section>
  );
}

export function DemoJourneyPanel() {
  return (
    <section className="component-card wide-card">
      <p className="component-label">Demo story mode</p>
      <h2>Sample client journey</h2>
      <p>One narrative that ties the installed modules together for a template demo.</p>
      <div className="timeline">
        {demoJourneySteps.map((step) => (
          <div key={step.label}>
            <strong>{step.label}</strong>
            <span>Template preview</span>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
