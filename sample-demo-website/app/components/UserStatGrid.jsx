export default function UserStatGrid({ counts }) {
  const stats = [
    ["Total users", counts.total],
    ["Clients", counts.client],
    ["Managers", counts.manager],
    ["Active", counts.active],
    ["Invited", counts.invited]
  ];

  return (
    <section className="user-stat-grid" aria-label="User database summary">
      {stats.map(([label, value]) => (
        <div className="user-stat" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
