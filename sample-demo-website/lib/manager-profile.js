export const managerPermissionAreas = ["users", "scheduling", "files", "exports", "audits", "workflows", "quality"];

export const managerTeams = ["operations", "admin", "support", "sales", "field-management"];

export function createManagerPermissionsProfile({ managerId, areas = managerPermissionAreas, level = "standard" }) {
  return {
    managerId,
    level,
    permissions: areas.reduce((permissions, area) => {
      permissions[area] = true;
      return permissions;
    }, {}),
    updatedAt: new Date().toISOString()
  };
}

export function createTeamAssignment({ managerId, team = "operations", title = "Manager" }) {
  return {
    managerId,
    team,
    title,
    status: "active",
    assignedAt: new Date().toISOString()
  };
}

export function createWorkloadProfile({ managerId, activeCount = 0, maxActive = 25, availability = [] }) {
  return {
    managerId,
    activeCount,
    maxActive,
    capacityPercent: Math.round((activeCount / maxActive) * 100),
    availability,
    updatedAt: new Date().toISOString()
  };
}

export function createEscalationRole({ managerId, escalationLevel = "standard", canOverride = false }) {
  return {
    managerId,
    escalationLevel,
    canApproveSensitiveActions: escalationLevel !== "standard",
    canOverride,
    updatedAt: new Date().toISOString()
  };
}

export function createApprovalAuthority({ managerId, maxApprovalAmount = 0, canApproveExports = false, canApproveRoleChanges = false }) {
  return {
    managerId,
    maxApprovalAmount,
    canApproveExports,
    canApproveRoleChanges,
    updatedAt: new Date().toISOString()
  };
}

export function createManagerAuditSummary({ managerId, signIns = 0, sensitiveActions = 0, exports = 0 }) {
  return {
    managerId,
    signIns,
    sensitiveActions,
    exports,
    reviewedAt: new Date().toISOString()
  };
}

export function createManagerDelegation({ managerId, substituteManagerId, startsAt, endsAt }) {
  return {
    managerId,
    substituteManagerId,
    startsAt,
    endsAt,
    status: "scheduled",
    createdAt: new Date().toISOString()
  };
}

export function createManagedAccountsList({ managerId, accountIds = [] }) {
  return {
    managerId,
    accountIds,
    count: accountIds.length,
    updatedAt: new Date().toISOString()
  };
}

export function createManagerAvailability({ managerId, timezone = "America/New_York", windows = [] }) {
  return {
    managerId,
    timezone,
    windows,
    updatedAt: new Date().toISOString()
  };
}

export function createAccessReviewStatus({ managerId, reviewerId, nextReviewDue }) {
  return {
    managerId,
    reviewerId,
    status: "scheduled",
    lastReviewedAt: null,
    nextReviewDue,
    createdAt: new Date().toISOString()
  };
}
