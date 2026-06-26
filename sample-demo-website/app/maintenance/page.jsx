import { getMaintenanceState } from "../../lib/maintenance-mode";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Maintenance | Sample Demo Website",
  description: "Maintenance mode boilerplate page."
};

export default function MaintenancePage() {
  const state = getMaintenanceState();

  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Maintenance" }]}
      eyebrow="Maintenance"
      title="Maintenance mode boilerplate is installed."
      description="This route can be used as the controlled fallback page when future sites need temporary maintenance windows."
    >
      <section className="component-card wide-card">
        <p className="component-label">Current state</p>
        <h2>{state.enabled ? "Enabled" : "Disabled"}</h2>
        <p>{state.message}</p>
      </section>
    </WorkspaceLayout>
  );
}
