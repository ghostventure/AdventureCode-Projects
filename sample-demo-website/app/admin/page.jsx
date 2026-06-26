import {
  AccountStatusControls,
  AuditLogViewer,
  InviteUserFlow,
  RuleStatusPanel,
  SensitiveActionConfirm,
  SessionTimeoutWarning
} from "../components/AdminSecurityComponents";
import ComponentGrid from "../components/ComponentGrid";
import DataTable from "../components/DataTable";
import ExportActions from "../components/ExportActions";
import {
  ArchiveHistoryPanel,
  LegalReviewStatusPanel,
  LeaseSetupChecklistPanel,
  ModuleEnableMatrixPanel,
  PrintExportPreviewPanel
} from "../components/LeasingTemplateComponents";
import PaginatedDataTable from "../components/PaginatedDataTable";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Admin Components | Sample Demo Website",
  description: "Installed admin and security operation components."
};

export default function AdminPage() {
  const columns = [
    { key: "event", label: "Event" },
    { key: "status", label: "Status" },
    { key: "actor", label: "Actor" }
  ];
  const rows = [
    { id: "audit-1", event: "Client self-read", status: "Allowed", actor: "client" },
    { id: "audit-2", event: "Unknown write", status: "Blocked", actor: "anonymous" },
    { id: "audit-3", event: "Manager update", status: "Allowed", actor: "manager" }
  ];

  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin" }]}
      eyebrow="Admin controls"
      title="Admin and security components are installed."
      description="These surfaces support user invitations, account state control, audit visibility, rule status, session warnings, and sensitive action confirmation."
    >
      <ComponentGrid>
        <InviteUserFlow />
        <AccountStatusControls />
        <AuditLogViewer />
        <RuleStatusPanel />
        <SessionTimeoutWarning />
        <SensitiveActionConfirm />
        <LeaseSetupChecklistPanel />
        <ModuleEnableMatrixPanel />
        <LegalReviewStatusPanel />
        <PrintExportPreviewPanel />
        <ArchiveHistoryPanel />
        <ExportActions />
      </ComponentGrid>
      <section className="component-card wide-card">
        <p className="component-label">Persistent audit table</p>
        <DataTable columns={columns} rows={rows} />
      </section>
      <PaginatedDataTable columns={columns} rows={rows} pageSize={2} />
    </WorkspaceLayout>
  );
}
