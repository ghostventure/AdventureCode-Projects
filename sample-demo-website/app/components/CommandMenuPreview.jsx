import { Search } from "lucide-react";

export default function CommandMenuPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Command menu</p>
      <div className="search-shell">
        <Search size={18} aria-hidden="true" />
        <span>Search users, requests, invoices, documents...</span>
      </div>
      <div className="split-list">
        <span>Go to client directory</span>
        <span>Create estimate request</span>
        <span>Open security log</span>
      </div>
    </section>
  );
}
