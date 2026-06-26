import ComponentGrid from "../components/ComponentGrid";
import {
  BackupExportPanel,
  ConsentPanel,
  ContentModelPanel,
  EmailAdapterPanel,
  EnvironmentContractPanel,
  FeatureFlagPanel,
  GuiTemplatePanel,
  InvitationPanel,
  LegalSummaryPanel,
  MaintenancePanel,
  RateLimitPanel,
  SeoSchemaPanel,
  SessionAuditPanel
} from "../components/PlatformComponents";
import {
  ClientLeasePresetPanel,
  ComponentInventoryPanel,
  ComponentMetadataPanel,
  DataRetentionControlsPanel,
  LeaseSetupChecklistPanel,
  ModuleEnableMatrixPanel,
  NotificationPreferencesPanel,
  TemplateComparisonPanel,
  TenantCustomizationPanel,
  ThemePresetSwatchesPanel
} from "../components/LeasingTemplateComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Platform Components | Sample Demo Website",
  description: "Reusable production platform controls for future websites."
};

export default function PlatformPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Platform" }]}
      eyebrow="Platform controls"
      title="Reusable production controls are installed."
      description="This page gathers the default infrastructure pieces that can be carried into future websites before domain-specific UI is built."
    >
      <ComponentGrid>
        <ComponentInventoryPanel />
        <ComponentMetadataPanel />
        <TenantCustomizationPanel />
        <GuiTemplatePanel />
        <ThemePresetSwatchesPanel />
        <ClientLeasePresetPanel />
        <TemplateComparisonPanel />
        <LeaseSetupChecklistPanel />
        <ModuleEnableMatrixPanel />
        <DataRetentionControlsPanel />
        <FeatureFlagPanel />
        <RateLimitPanel />
        <ConsentPanel />
        <NotificationPreferencesPanel />
        <EmailAdapterPanel />
        <ContentModelPanel />
        <SeoSchemaPanel />
        <BackupExportPanel />
        <MaintenancePanel />
        <InvitationPanel />
        <SessionAuditPanel />
        <EnvironmentContractPanel />
        <LegalSummaryPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
