import { USER_ROLES } from "../../lib/user-database";

export default function RoleBadge({ role }) {
  const label = role === USER_ROLES.MANAGER ? "Manager" : "Client";

  return <span className={`role-badge role-badge-${role}`}>{label}</span>;
}
