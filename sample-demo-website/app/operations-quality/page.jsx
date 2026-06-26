import ComponentGrid from "../components/ComponentGrid";
import {
  ChangeControlPanel,
  PostLaunchMonitorPanel,
  QualityFindingPanel,
  QualityGatePanel,
  QualityScorePanel,
  ReleaseReadinessPanel,
  RunbookPanel
} from "../components/OperationsQualityComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Operations and Quality | Sample Demo Website",
  description: "Reusable operations and quality controls for future websites."
};

export default function OperationsQualityPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Operations and Quality" }]}
      eyebrow="Operations and quality"
      title="Operations and quality components are installed."
      description="This layer adds release readiness, QA gates, runbooks, change control, quality findings, scoring, and post-launch monitoring hooks."
    >
      <ComponentGrid>
        <QualityGatePanel />
        <QualityScorePanel />
        <ReleaseReadinessPanel />
        <ChangeControlPanel />
        <RunbookPanel />
        <QualityFindingPanel />
        <PostLaunchMonitorPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
