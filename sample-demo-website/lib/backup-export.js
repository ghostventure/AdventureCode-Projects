export const exportCollections = [
  "users",
  "auditLogs",
  "invitations",
  "consents",
  "contentRevisions",
  "requests",
  "workItems",
  "approvals",
  "reports",
  "qualityFindings",
  "releaseRecords",
  "changeRequests",
  "runbooks",
  "profileActivities",
  "profileAttachments",
  "managerAssignments",
  "delegatedAccess",
  "duplicateProfileSignals",
  "profileVersions",
  "profileReviewQueue",
  "customProfileFields",
  "accountGroups",
  "profileRetentionPolicies",
  "profileImportJobs",
  "managerProfiles",
  "managerDelegations",
  "managerAccessReviews",
  "managerAuditSummaries"
];

export function createExportManifest({ requestedBy = "system", collections = exportCollections } = {}) {
  return {
    requestedBy,
    collections,
    format: "jsonl",
    status: "queued",
    requestedAt: new Date().toISOString()
  };
}

export function toJsonLines(records = []) {
  return records.map((record) => JSON.stringify(record)).join("\n");
}
