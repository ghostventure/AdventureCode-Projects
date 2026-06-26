export default function RoleRouterPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Role router</p>
      <h2>Client and manager handoff</h2>
      <div className="split-list">
        <span>Client role to /client</span>
        <span>Manager role to /manager</span>
        <span>Unknown role to access review</span>
      </div>
    </section>
  );
}
