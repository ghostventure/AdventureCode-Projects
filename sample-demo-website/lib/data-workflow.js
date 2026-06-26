export const workflowStatuses = ["new", "triage", "assigned", "in-progress", "review", "approved", "completed", "archived"];

export const workflowTransitions = Object.freeze({
  new: ["triage", "archived"],
  triage: ["assigned", "archived"],
  assigned: ["in-progress", "archived"],
  "in-progress": ["review", "archived"],
  review: ["approved", "in-progress", "archived"],
  approved: ["completed", "archived"],
  completed: ["archived"],
  archived: []
});

export const dataCollections = [
  { key: "requests", owner: "client", workflow: true },
  { key: "workItems", owner: "manager", workflow: true },
  { key: "approvals", owner: "manager", workflow: true },
  { key: "imports", owner: "manager", workflow: false },
  { key: "exports", owner: "manager", workflow: false },
  { key: "reports", owner: "manager", workflow: false }
];

export function canTransitionWorkflow(fromStatus, toStatus) {
  return workflowTransitions[fromStatus]?.includes(toStatus) || false;
}

export function createWorkflowItem({ title, ownerId, status = "new", priority = "normal", metadata = {} }) {
  return {
    title,
    ownerId,
    status,
    priority,
    metadata,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function transitionWorkflow(item, nextStatus, actorId = "system") {
  if (!canTransitionWorkflow(item.status, nextStatus)) {
    return {
      ok: false,
      item,
      error: `Cannot transition from ${item.status} to ${nextStatus}.`
    };
  }

  return {
    ok: true,
    item: {
      ...item,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    },
    event: {
      actorId,
      fromStatus: item.status,
      toStatus: nextStatus,
      createdAt: new Date().toISOString()
    }
  };
}

export function createApprovalRequest({ targetId, requestedBy, approverId, summary }) {
  return {
    targetId,
    requestedBy,
    approverId,
    summary,
    status: "pending",
    requestedAt: new Date().toISOString()
  };
}

export function createDataJob({ type, collection, requestedBy = "system" }) {
  return {
    type,
    collection,
    requestedBy,
    status: "queued",
    progress: 0,
    createdAt: new Date().toISOString()
  };
}

export function createAutomationRule({ trigger, action, enabled = true }) {
  return {
    trigger,
    action,
    enabled,
    createdAt: new Date().toISOString()
  };
}

export function createReportDefinition({ name, collection, metrics = [] }) {
  return {
    name,
    collection,
    metrics,
    status: "draft",
    createdAt: new Date().toISOString()
  };
}
