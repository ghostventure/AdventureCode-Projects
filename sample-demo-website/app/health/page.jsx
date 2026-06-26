import ComponentGrid from "../components/ComponentGrid";
import { EnvironmentReadiness, HealthCheckPanel } from "../components/HealthComponents";
import { DeploymentStatusPanel, ErrorRecoveryPanel } from "../components/LeasingTemplateComponents";
import {
  CircuitBreakerPanel,
  DegradedModePanel,
  ErrorBudgetPanel,
  IncidentPanel,
  ReliabilitySnapshotPanel,
  RetryPolicyPanel,
  StructuredLogPanel
} from "../components/ReliabilityComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Health | Sample Demo Website",
  description: "Health check and environment readiness components."
};

export default function HealthPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Health" }]}
      eyebrow="Health"
      title="Health and environment checks are installed."
      description="This route keeps runtime readiness visible before deployment."
    >
      <ComponentGrid>
        <HealthCheckPanel />
        <DeploymentStatusPanel />
        <ErrorRecoveryPanel />
        <EnvironmentReadiness />
        <ReliabilitySnapshotPanel />
        <RetryPolicyPanel />
        <CircuitBreakerPanel />
        <ErrorBudgetPanel />
        <DegradedModePanel />
        <IncidentPanel />
        <StructuredLogPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
