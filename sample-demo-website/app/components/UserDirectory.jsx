import RoleBadge from "./RoleBadge";

export default function UserDirectory({ title, description, users }) {
  return (
    <section className="directory-section">
      <div className="directory-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="user-grid">
        {users.map((user) => (
          <article className="user-card" key={user.uid}>
            <div className="user-card-top">
              <div>
                <h3>{user.displayName}</h3>
                <p>{user.email}</p>
              </div>
              <RoleBadge role={user.role} />
            </div>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{user.status}</dd>
              </div>
              <div>
                <dt>{user.role === "manager" ? "Scope" : "Plan"}</dt>
                <dd>{user.role === "manager" ? user.managerScope : user.servicePlan}</dd>
              </div>
              <div>
                <dt>{user.role === "manager" ? "Organization" : "Property"}</dt>
                <dd>{user.role === "manager" ? user.companyName : user.propertyAddress}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
