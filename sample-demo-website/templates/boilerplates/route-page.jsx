import ComponentGrid from "../../app/components/ComponentGrid";
import WorkspaceLayout from "../../app/components/WorkspaceLayout";

export const metadata = {
  title: "Page Title | Site Name",
  description: "Page description."
};

export default function TemplatePage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Page" }]}
      eyebrow="Section"
      title="Page heading."
      description="Page summary."
    >
      <ComponentGrid>
        {/* Add reusable components here. */}
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
