import ComponentGrid from "../components/ComponentGrid";
import {
  ApprovalPanel,
  AutomationPanel,
  DataCollectionsPanel,
  DataJobPanel,
  ReportingPanel,
  WorkflowStatePanel,
  WorkflowTransitionPanel
} from "../components/DataWorkflowComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Data and Workflow | Sample Demo Website",
  description: "Reusable data and workflow infrastructure for future websites."
};

export default function DataWorkflowPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Data and Workflow" }]}
      eyebrow="Data and workflow"
      title="Data and workflow components are installed."
      description="This layer provides reusable records, lifecycle states, transitions, approvals, import/export jobs, automation rules, and reporting definitions."
    >
      <ComponentGrid>
        <DataCollectionsPanel />
        <WorkflowStatePanel />
        <WorkflowTransitionPanel />
        <ApprovalPanel />
        <DataJobPanel />
        <AutomationPanel />
        <ReportingPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
