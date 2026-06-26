import { getFirebaseStorage } from "../../lib/storage-service";

export default function FileStoragePanel() {
  const configured = Boolean(getFirebaseStorage());

  return (
    <section className="component-card">
      <p className="component-label">Firebase Storage wiring</p>
      <h2>{configured ? "Configured" : "Waiting for env"}</h2>
      <p>Upload helper is installed and ready for authenticated file paths.</p>
    </section>
  );
}
