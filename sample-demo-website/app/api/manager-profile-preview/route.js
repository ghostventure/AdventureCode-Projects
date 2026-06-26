import { NextResponse } from "next/server";
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
  createWorkloadProfile
} from "../../../lib/manager-profile";

export function GET() {
  const managerId = "manager-demo-001";

  return NextResponse.json({
    ok: true,
    managerProfile: {
      managerId,
      permissions: createManagerPermissionsProfile({ managerId, level: "lead" }),
      team: createTeamAssignment({ managerId, team: "operations" }),
      workload: createWorkloadProfile({ managerId, activeCount: 12, maxActive: 25 }),
      escalation: createEscalationRole({ managerId, escalationLevel: "senior", canOverride: true }),
      approvalAuthority: createApprovalAuthority({ managerId, maxApprovalAmount: 2500, canApproveExports: true }),
      audit: createManagerAuditSummary({ managerId, signIns: 12, sensitiveActions: 2, exports: 1 }),
      delegation: createManagerDelegation({
        managerId,
        substituteManagerId: "manager-backup-001",
        startsAt: "2026-06-01T09:00:00.000Z",
        endsAt: "2026-06-07T17:00:00.000Z"
      }),
      managedAccounts: createManagedAccountsList({ managerId, accountIds: ["client-demo-001", "client-demo-002"] }),
      availability: createManagerAvailability({ managerId, windows: [{ day: "Monday", start: "09:00", end: "17:00" }] }),
      accessReview: createAccessReviewStatus({ managerId, reviewerId: "admin-preview", nextReviewDue: "2026-08-01" })
    }
  });
}
