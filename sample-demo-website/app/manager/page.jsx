import ComponentGrid from "../components/ComponentGrid";
import {
  ApprovalAuthorityPanel,
  EscalationRolePanel,
  ManagedAccountsPanel,
  ManagerAccessReviewPanel,
  ManagerAuditDashboardPanel,
  ManagerAvailabilityPanel,
  ManagerDelegationPanel,
  ManagerPermissionsProfilePanel,
  TeamAssignmentPanel,
  WorkloadCapacityPanel
} from "../components/ManagerProfileComponents";
import {
  ActivityLogPreview,
  CrewAssignmentBoard,
  DirectoryFilters,
  EstimateBuilderPreview,
  JobSchedulerPreview,
  LeadIntakeQueue,
  ManagerDashboardSummary,
  PermissionManagementPanel,
  StatusPipeline,
  TaskChecklist
} from "../components/ManagerComponents";
import {
  MediaGalleryPanel,
  ManagerCommandCenterPanel,
  ProjectDetailPanel,
  QuoteReviewPanel,
  ServiceCatalogPanel,
  SupportTicketPanel
} from "../components/LeasingTemplateComponents";
import ProtectedRoute from "../components/ProtectedRoute";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Manager Workspace | Sample Demo Website",
  description: "Manager workspace placeholder for the home services platform."
};

export default function ManagerPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Manager" }]}
      eyebrow="Manager workspace"
      title="Manager operations components are installed."
      description="These components cover dashboard summaries, filters, intake, estimates, scheduling, assignments, tasks, status flow, notes, and permissions."
    >
      <ProtectedRoute role="manager" route="/manager">
        <section className="component-card wide-card">
          <p className="component-label">Protected route wrapper</p>
          <h2>Manager access allowed in template preview</h2>
          <p>This wrapper is ready to switch from preview role data to Firebase Auth claims.</p>
        </section>
      </ProtectedRoute>
      <ManagerCommandCenterPanel />
      <ComponentGrid>
        <ManagerDashboardSummary />
        <DirectoryFilters />
        <LeadIntakeQueue />
        <ProjectDetailPanel />
        <ServiceCatalogPanel />
        <QuoteReviewPanel />
        <EstimateBuilderPreview />
        <JobSchedulerPreview />
        <CrewAssignmentBoard />
        <MediaGalleryPanel />
        <SupportTicketPanel />
        <TaskChecklist />
        <StatusPipeline />
        <ActivityLogPreview />
        <PermissionManagementPanel />
        <ManagerPermissionsProfilePanel />
        <TeamAssignmentPanel />
        <WorkloadCapacityPanel />
        <EscalationRolePanel />
        <ApprovalAuthorityPanel />
        <ManagerAuditDashboardPanel />
        <ManagerDelegationPanel />
        <ManagedAccountsPanel />
        <ManagerAvailabilityPanel />
        <ManagerAccessReviewPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
