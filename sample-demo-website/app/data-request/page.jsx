import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Data Request | Sample Demo Website",
  description: "Data request boilerplate for access, correction, deletion, and export workflows."
};

export default function DataRequestPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Data Request" }]}
      eyebrow="Data rights"
      title="Data request boilerplate is installed."
      description="Use this page as the future intake route for privacy access, correction, export, and deletion requests."
    >
      <section className="component-card wide-card">
        <form className="form-stack">
          <label>
            Email
            <input type="email" placeholder="client@example.com" />
          </label>
          <label>
            Request type
            <select defaultValue="access">
              <option value="access">Access</option>
              <option value="correct">Correct</option>
              <option value="export">Export</option>
              <option value="delete">Delete</option>
            </select>
          </label>
          <label>
            Details
            <textarea placeholder="Describe the request." />
          </label>
          <button type="button">Preview request</button>
        </form>
      </section>
    </WorkspaceLayout>
  );
}
