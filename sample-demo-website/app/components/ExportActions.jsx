import { Download, FileText } from "lucide-react";

export default function ExportActions() {
  return (
    <section className="component-card">
      <p className="component-label">Export actions</p>
      <div className="button-row">
        <button type="button"><Download size={16} aria-hidden="true" /> CSV</button>
        <button className="secondary-button" type="button"><FileText size={16} aria-hidden="true" /> PDF</button>
      </div>
    </section>
  );
}
