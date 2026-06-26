export default function StatusCard({ label, value, detail }) {
  return (
    <article className="status-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
