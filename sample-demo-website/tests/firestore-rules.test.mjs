import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");

describe("firestore.rules template checks", () => {
  it("denies unmatched access by default", () => {
    assert.match(rules, /match \/\{document=\*\*\}/);
    assert.match(rules, /allow read, write: if false/);
  });

  it("requires active manager status for manager access", () => {
    assert.match(rules, /role == "manager"/);
    assert.match(rules, /status == "active"/);
  });

  it("validates user payload shape", () => {
    assert.match(rules, /validUserPayload/);
    assert.match(rules, /validRole/);
    assert.match(rules, /validStatus/);
  });

  it("covers platform support collections", () => {
    assert.match(rules, /match \/auditLogs\/\{eventId\}/);
    assert.match(rules, /match \/invitations\/\{invitationId\}/);
    assert.match(rules, /match \/consents\/\{userId\}/);
    assert.match(rules, /match \/contentRevisions\/\{revisionId\}/);
  });

  it("covers auth account support collections", () => {
    assert.match(rules, /match \/loginHistory\/\{eventId\}/);
    assert.match(rules, /match \/deviceSessions\/\{userId\}\/sessions\/\{sessionId\}/);
    assert.match(rules, /match \/claimSyncRequests\/\{requestId\}/);
  });

  it("covers communication support collections", () => {
    assert.match(rules, /match \/conversations\/\{conversationId\}/);
    assert.match(rules, /match \/messages\/\{messageId\}/);
    assert.match(rules, /match \/notifications\/\{userId\}\/items\/\{notificationId\}/);
    assert.match(rules, /match \/deliveryReceipts\/\{receiptId\}/);
    assert.match(rules, /match \/webhookEvents\/\{eventId\}/);
  });

  it("covers data and workflow support collections", () => {
    assert.match(rules, /match \/requests\/\{requestId\}/);
    assert.match(rules, /match \/workItems\/\{itemId\}/);
    assert.match(rules, /match \/workflowEvents\/\{eventId\}/);
    assert.match(rules, /match \/approvals\/\{approvalId\}/);
    assert.match(rules, /match \/dataJobs\/\{jobId\}/);
    assert.match(rules, /match \/automationRules\/\{ruleId\}/);
    assert.match(rules, /match \/reports\/\{reportId\}/);
  });

  it("covers operations and quality support collections", () => {
    assert.match(rules, /match \/qualityFindings\/\{findingId\}/);
    assert.match(rules, /match \/releaseRecords\/\{releaseId\}/);
    assert.match(rules, /match \/changeRequests\/\{changeId\}/);
    assert.match(rules, /match \/runbooks\/\{runbookId\}/);
    assert.match(rules, /match \/postLaunchMonitors\/\{monitorId\}/);
  });

  it("covers user profile support collections", () => {
    assert.match(rules, /match \/profileActivities\/\{activityId\}/);
    assert.match(rules, /match \/profileAttachments\/\{attachmentId\}/);
    assert.match(rules, /match \/managerAssignments\/\{assignmentId\}/);
    assert.match(rules, /match \/delegatedAccess\/\{accessId\}/);
    assert.match(rules, /match \/duplicateProfileSignals\/\{signalId\}/);
  });

  it("covers user profile governance collections", () => {
    assert.match(rules, /match \/profileVersions\/\{versionId\}/);
    assert.match(rules, /match \/profileReviewQueue\/\{reviewId\}/);
    assert.match(rules, /match \/customProfileFields\/\{fieldId\}/);
    assert.match(rules, /match \/accountGroups\/\{groupId\}/);
    assert.match(rules, /match \/profileRetentionPolicies\/\{policyId\}/);
    assert.match(rules, /match \/profileImportJobs\/\{jobId\}/);
  });

  it("covers manager profile support collections", () => {
    assert.match(rules, /match \/managerProfiles\/\{managerId\}/);
    assert.match(rules, /match \/managerDelegations\/\{delegationId\}/);
    assert.match(rules, /match \/managerAccessReviews\/\{reviewId\}/);
    assert.match(rules, /match \/managerAuditSummaries\/\{summaryId\}/);
  });
});
