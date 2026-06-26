import { consentCategories, legalBoilerplate } from "../../lib/consent-policy";
import { DataRetentionControlsPanel, LegalReviewStatusPanel } from "../components/LeasingTemplateComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Privacy | Sample Demo Website",
  description: "Privacy and consent boilerplate for future website launches."
};

export default function PrivacyPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy" }]}
      eyebrow="Privacy boilerplate"
      title="Privacy and consent boilerplate is installed."
      description="Customize this route for each future website owner, service area, analytics stack, and data retention requirement."
    >
      <section className="component-card wide-card">
        <p className="component-label">Owner placeholder</p>
        <p>{legalBoilerplate.controller}</p>
      </section>
      <section className="component-card wide-card">
        <p className="component-label">Consent categories</p>
        <ul className="check-list">
          {consentCategories.map((category) => (
            <li key={category.key}>{category.label}: {category.required ? "always required" : "user selectable"}</li>
          ))}
        </ul>
      </section>
      <LegalReviewStatusPanel />
      <DataRetentionControlsPanel />
    </WorkspaceLayout>
  );
}
