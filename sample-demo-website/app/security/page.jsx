import {
  AccountStatusControls,
  AuditLogViewer,
  DexterityOptimizationPanel,
  RuleStatusPanel,
  SensitiveActionConfirm,
  SessionTimeoutWarning,
  TamperResistancePanel
} from "../components/AdminSecurityComponents";
import ComponentGrid from "../components/ComponentGrid";
import FileStoragePanel from "../components/FileStoragePanel";
import { EnvironmentReadiness, HealthCheckPanel } from "../components/HealthComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Security Baseline | Sample Demo Website",
  description: "Security and hardening status for the sample home services platform."
};

export default function SecurityPage() {
  const controls = [
    "Firestore deny-by-default rules",
    "Client and active-manager access model",
    "Content security policy",
    "Frame blocking",
    "Same-origin resource policy and origin isolation",
    "Tamper-resistant middleware guard for workspace/API routes",
    "No-store cache boundary on guarded routes",
    "Disabled production browser source maps",
    "Pinned Firebase project deployment scripts",
    "Dependency audit script",
    "10-minute inactivity auto sign-out signal"
  ];

  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Security" }]}
      eyebrow="Security baseline"
      title="Tamper-resistant controls are tracked here."
      description="This route keeps the current hardening controls visible while the product is still being built from the bottom up."
    >
      <section className="component-card wide-card">
        <p>
          Current controls installed in the platform baseline.
        </p>
        <ul className="check-list">
          {controls.map((control) => (
            <li key={control}>{control}</li>
          ))}
        </ul>
      </section>
      <ComponentGrid>
        <TamperResistancePanel />
        <DexterityOptimizationPanel />
        <AuditLogViewer />
        <RuleStatusPanel />
        <AccountStatusControls />
        <SessionTimeoutWarning />
        <SensitiveActionConfirm />
        <HealthCheckPanel />
        <EnvironmentReadiness />
        <FileStoragePanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
