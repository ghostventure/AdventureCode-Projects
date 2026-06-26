import { Upload } from "lucide-react";

export default function FileUploadPreview() {
  return (
    <section className="component-card">
      <p className="component-label">File upload</p>
      <div className="upload-zone">
        <Upload size={22} aria-hidden="true" />
        <strong>Drop files here</strong>
        <span>Ready for Firebase Storage wiring.</span>
      </div>
    </section>
  );
}
