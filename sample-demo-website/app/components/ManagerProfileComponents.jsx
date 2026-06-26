import {
  createAccessReviewStatus,
  createApprovalAuthority,
  createEscalationRole,
  createManagedAccountsList,
  createManagerAuditSummary,
  createManagerAvailability,
  createManagerDelegation,
  createManagerPermissionsProfile,
  createTeamAssignment,
  createWorkloadProfile,
  managerTeams
} from "../../lib/manager-profile";

const managerId = "manager-demo-001";

export function ManagerPermissionsProfilePanel() {
  const profile = createManagerPermissionsProfile({ managerId, level: "lead" });

  return (
    <section className="component-card">
      <p className="component-label">Manager permissions</p>
      <h2>{profile.level}</h2>
      <p>{Object.keys(profile.permissions).length} permission areas enabled.</p>
    </section>
  );
}

export function TeamAssignmentPanel() {
  const assignment = createTeamAssignment({ managerId, team: "operations", title: "Operations manager" });

  return (
    <section className="component-card">
      <p className="component-label">Team assignment</p>
      <h2>{assignment.team}</h2>
      <p>{assignment.title}. Available teams: {managerTeams.length}</p>
    </section>
  );
}

export function WorkloadCapacityPanel() {
  const workload = createWorkloadProfile({ managerId, activeCount: 12, maxActive: 25 });

  return (
    <section className="component-card">
      <p className="component-label">Workload capacity</p>
      <h2>{workload.capacityPercent}%</h2>
      <p>{workload.activeCount} of {workload.maxActive} active work items assigned.</p>
    </section>
  );
}

export function EscalationRolePanel() {
  const role = createEscalationRole({ managerId, escalationLevel: "senior", canOverride: true });

  return (
    <section className="component-card warning-card">
      <p className="component-label">Escalation role</p>
      <h2>{role.escalationLevel}</h2>
      <p>Override authority: {role.canOverride ? "enabled" : "disabled"}</p>
    </section>
  );
}

export function ApprovalAuthorityPanel() {
  const authority = createApprovalAuthority({
    managerId,
    maxApprovalAmount: 2500,
    canApproveExports: true,
    canApproveRoleChanges: false
  });

  return (
    <section className="component-card">
      <p className="component-label">Approval limits</p>
      <h2>${authority.maxApprovalAmount}</h2>
      <p>Exports: {authority.canApproveExports ? "allowed" : "blocked"}; role changes require admin review.</p>
    </section>
  );
}

export function ManagerAuditDashboardPanel() {
  const audit = createManagerAuditSummary({ managerId, signIns: 12, sensitiveActions: 2, exports: 1 });

  return (
    <section className="component-card">
      <p className="component-label">Manager audit dashboard</p>
      <div className="split-list">
        <span>Sign-ins: {audit.signIns}</span>
        <span>Sensitive actions: {audit.sensitiveActions}</span>
        <span>Exports: {audit.exports}</span>
      </div>
    </section>
  );
}

export function ManagerDelegationPanel() {
  const delegation = createManagerDelegation({
    managerId,
    substituteManagerId: "manager-backup-001",
    startsAt: "2026-06-01T09:00:00.000Z",
    endsAt: "2026-06-07T17:00:00.000Z"
  });

  return (
    <section className="component-card">
      <p className="component-label">Delegation</p>
      <h2>{delegation.status}</h2>
      <p>Substitute: {delegation.substituteManagerId}</p>
    </section>
  );
}

export function ManagedAccountsPanel() {
  const accounts = createManagedAccountsList({ managerId, accountIds: ["client-demo-001", "client-demo-002"] });

  return (
    <section className="component-card">
      <p className="component-label">Managed accounts</p>
      <h2>{accounts.count}</h2>
      <p>Assigned client/company account IDs are tracked separately from profile data.</p>
    </section>
  );
}

export function ManagerAvailabilityPanel() {
  const availability = createManagerAvailability({
    managerId,
    windows: [{ day: "Monday", start: "09:00", end: "17:00" }]
  });

  return (
    <section className="component-card">
      <p className="component-label">Availability calendar</p>
      <h2>{availability.timezone}</h2>
      <p>{availability.windows.length} availability window staged.</p>
    </section>
  );
}

export function ManagerAccessReviewPanel() {
  const review = createAccessReviewStatus({
    managerId,
    reviewerId: "admin-preview",
    nextReviewDue: "2026-08-01"
  });

  return (
    <section className="component-card">
      <p className="component-label">Access review</p>
      <h2>{review.status}</h2>
      <p>Next review due: {review.nextReviewDue}</p>
    </section>
  );
}
