import CommandMenuPreview from "../components/CommandMenuPreview";
import ComponentGrid from "../components/ComponentGrid";
import CalendarBoard from "../components/CalendarBoard";
import DataTable from "../components/DataTable";
import ExportActions from "../components/ExportActions";
import FileUploadPreview from "../components/FileUploadPreview";
import NotificationCenter from "../components/NotificationCenter";
import PaginatedDataTable from "../components/PaginatedDataTable";
import { EmptyState, LoadingSkeletons, ModalDrawerPreview, ToastStack } from "../components/FeedbackComponents";
import KanbanBoard from "../components/KanbanBoard";
import {
  DemoSeedSwitcherPanel,
  EmptyStateVariantsPanel,
  ErrorRecoveryPanel,
  FormStateVariantsPanel,
  LoadingVariantPanel,
  MobileNavigationStatePanel,
  MobilePreviewPanel
} from "../components/LeasingTemplateComponents";
import { JobSchedulerPreview, LeadIntakeQueue, StatusPipeline, TaskChecklist } from "../components/ManagerComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Operations | Sample Demo Website",
  description: "Operations placeholder for estimates, scheduling, and service workflows."
};

export default function OperationsPage() {
  const columns = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Owner" }
  ];
  const rows = [
    { id: "row-1", name: "Client invite", status: "Open", owner: "Manager" },
    { id: "row-2", name: "Document review", status: "Ready", owner: "Admin" },
    { id: "row-3", name: "Follow-up", status: "Scheduled", owner: "Client team" }
  ];

  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Operations" }]}
      eyebrow="Operations"
      title="Workflow components are installed."
      description="These reusable operations surfaces support search, queues, scheduling, task flow, notifications, loading, empty, and confirmation states."
    >
      <ComponentGrid>
        <CommandMenuPreview />
        <NotificationCenter />
        <CalendarBoard />
        <FileUploadPreview />
        <ExportActions />
        <LeadIntakeQueue />
        <JobSchedulerPreview />
        <TaskChecklist />
        <StatusPipeline />
        <DemoSeedSwitcherPanel />
        <FormStateVariantsPanel />
        <EmptyStateVariantsPanel />
        <LoadingVariantPanel />
        <ErrorRecoveryPanel />
        <MobilePreviewPanel />
        <MobileNavigationStatePanel />
        <ToastStack />
        <LoadingSkeletons />
        <EmptyState />
        <ModalDrawerPreview />
      </ComponentGrid>
      <KanbanBoard />
      <section className="component-card wide-card">
        <p className="component-label">Data table</p>
        <DataTable columns={columns} rows={rows} />
      </section>
      <PaginatedDataTable columns={columns} rows={rows} pageSize={2} />
    </WorkspaceLayout>
  );
}
