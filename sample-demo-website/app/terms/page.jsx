import { legalBoilerplate } from "../../lib/consent-policy";
import { LegalReviewStatusPanel, TemplateComparisonPanel } from "../components/LeasingTemplateComponents";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Terms | Sample Demo Website",
  description: "Terms boilerplate for future website launches."
};

export default function TermsPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
      eyebrow="Terms boilerplate"
      title="Terms boilerplate is installed."
      description="Replace these placeholders with each future site's payment, scheduling, cancellation, liability, and communication terms."
    >
      <section className="component-card wide-card">
        <p className="component-label">Last updated</p>
        <p>{legalBoilerplate.termsUpdated}</p>
      </section>
      <section className="component-card wide-card">
        <p className="component-label">Default sections</p>
        <ul className="check-list">
          <li>Service scope</li>
          <li>Payments and refunds</li>
          <li>Scheduling and cancellations</li>
          <li>Account responsibilities</li>
          <li>Limitations and disputes</li>
        </ul>
      </section>
      <LegalReviewStatusPanel />
      <TemplateComparisonPanel />
    </WorkspaceLayout>
  );
}
