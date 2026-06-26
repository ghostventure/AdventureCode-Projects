import {
  calculateProfileCompletion,
  createAddressBook,
  createAlternateContact,
  createAvatarProfile,
  createBillingProfile,
  createContactPreferences,
  createDelegatedAccess,
  createDuplicateProfileSignal,
  createIdentityStatus,
  createManagerAssignment,
  createPrivacyControlState,
  createProfileActivity,
  createProfileAttachment,
  createProfileReviewItem,
  createProfileVersion,
  createRetentionPolicy,
  createAccountGroup,
  createCustomFieldDefinition,
  profileTags
  ,
  canEditProfileField,
  mapImportedProfile
} from "../../lib/user-profile";
import { sampleUsers } from "../../lib/user-database";

const previewUser = sampleUsers[0];

export function ProfileCompletionPanel() {
  const completion = calculateProfileCompletion(previewUser);

  return (
    <section className="component-card">
      <p className="component-label">Profile completion</p>
      <h2>{completion.percent}%</h2>
      <p>{completion.missing.length ? `Missing: ${completion.missing.join(", ")}` : "Required profile fields are complete."}</p>
    </section>
  );
}

export function AvatarPanel() {
  const avatar = createAvatarProfile({ userId: previewUser.uid, displayName: previewUser.displayName });

  return (
    <section className="component-card">
      <p className="component-label">Avatar metadata</p>
      <h2>{avatar.initials}</h2>
      <p>Profile photo upload, fallback initials, and image validation hooks are staged.</p>
    </section>
  );
}

export function ContactPreferencesPanel() {
  const preferences = createContactPreferences({ userId: previewUser.uid, sms: true });

  return (
    <section className="component-card">
      <p className="component-label">Contact preferences</p>
      <div className="split-list">
        {Object.entries(preferences.channels).map(([channel, enabled]) => (
          <span key={channel}>{channel}: {enabled ? "on" : "off"}</span>
        ))}
      </div>
    </section>
  );
}

export function AddressBookPanel() {
  const addressBook = createAddressBook({
    userId: previewUser.uid,
    addresses: [
      { type: "service", label: "Primary service address" },
      { type: "billing", label: "Billing address" }
    ]
  });

  return (
    <section className="component-card">
      <p className="component-label">Address book</p>
      <h2>{addressBook.addresses.length}</h2>
      <p>Supports service, billing, mailing, and multi-property addresses.</p>
    </section>
  );
}

export function AlternateContactPanel() {
  const contact = createAlternateContact({
    userId: previewUser.uid,
    name: "Alternate Contact",
    phone: "(555) 012-0100"
  });

  return (
    <section className="component-card">
      <p className="component-label">Alternate contacts</p>
      <h2>{contact.status}</h2>
      <p>{contact.name}: {contact.relationship}</p>
    </section>
  );
}

export function BillingProfilePanel() {
  const billing = createBillingProfile({
    userId: previewUser.uid,
    billingName: previewUser.displayName,
    billingEmail: previewUser.email
  });

  return (
    <section className="component-card">
      <p className="component-label">Billing metadata</p>
      <h2>{billing.status}</h2>
      <p>Stores safe billing profile metadata without storing card data.</p>
    </section>
  );
}

export function IdentityStatusPanel() {
  const identity = createIdentityStatus({
    userId: previewUser.uid,
    emailVerified: true,
    managerApproved: true
  });

  return (
    <section className="component-card">
      <p className="component-label">Identity verification</p>
      <div className="split-list">
        <span>Email: {identity.emailVerified ? "verified" : "pending"}</span>
        <span>Phone: {identity.phoneVerified ? "verified" : "pending"}</span>
        <span>MFA: {identity.mfaEnabled ? "enabled" : "off"}</span>
        <span>Manager: {identity.managerApproved ? "approved" : "review"}</span>
      </div>
    </section>
  );
}

export function AccountActivityPanel() {
  const activity = createProfileActivity({
    userId: previewUser.uid,
    action: "profile.updated",
    detail: "Contact preferences changed"
  });

  return (
    <section className="component-card">
      <p className="component-label">Account activity</p>
      <h2>{activity.action}</h2>
      <p>{activity.detail}</p>
    </section>
  );
}

export function ProfilePrivacyPanel() {
  const privacy = createPrivacyControlState({ userId: previewUser.uid });

  return (
    <section className="component-card">
      <p className="component-label">Privacy controls</p>
      <div className="split-list">
        <span>Export data: {privacy.canExportData ? "available" : "off"}</span>
        <span>Delete request: {privacy.canRequestDeletion ? "available" : "off"}</span>
        <span>Consent: {privacy.consentVersion}</span>
      </div>
    </section>
  );
}

export function ProfileAttachmentPanel() {
  const attachment = createProfileAttachment({
    userId: previewUser.uid,
    name: "Agreement preview"
  });

  return (
    <section className="component-card">
      <p className="component-label">Profile attachments</p>
      <h2>{attachment.status}</h2>
      <p>{attachment.name}: {attachment.type}</p>
    </section>
  );
}

export function ManagerAssignmentPanel() {
  const assignment = createManagerAssignment({
    userId: previewUser.uid,
    managerId: "manager-demo-001"
  });

  return (
    <section className="component-card">
      <p className="component-label">Manager assignment</p>
      <h2>{assignment.status}</h2>
      <p>{assignment.managerId}: {assignment.reason}</p>
    </section>
  );
}

export function TagsSegmentsPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Tags and segments</p>
      <div className="split-list">
        {profileTags.slice(0, 5).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

export function DuplicateDetectionPanel() {
  const signal = createDuplicateProfileSignal({
    sourceUserId: "client-demo-001",
    possibleDuplicateUserId: "client-demo-002",
    confidence: 0.72
  });

  return (
    <section className="component-card warning-card">
      <p className="component-label">Duplicate detection</p>
      <h2>{Math.round(signal.confidence * 100)}%</h2>
      <p>Potential duplicate profiles are staged for manager review.</p>
    </section>
  );
}

export function DelegatedAccessPanel() {
  const access = createDelegatedAccess({
    accountId: previewUser.uid,
    delegateUserId: "delegate-preview"
  });

  return (
    <section className="component-card">
      <p className="component-label">Delegated access</p>
      <h2>{access.role}</h2>
      <p>Supports household, company, and assistant users under one account.</p>
    </section>
  );
}

export function ProfileVersionPanel() {
  const version = createProfileVersion({
    userId: previewUser.uid,
    snapshot: previewUser,
    changedBy: "manager-demo-001"
  });

  return (
    <section className="component-card">
      <p className="component-label">Profile versioning</p>
      <h2>snapshot</h2>
      <p>{version.changeReason} by {version.changedBy}</p>
    </section>
  );
}

export function FieldPermissionPanel() {
  const clientCanEditPhone = canEditProfileField({ field: "phone", actorRole: "client", isOwner: true });
  const clientCanEditPlan = canEditProfileField({ field: "servicePlan", actorRole: "client", isOwner: true });

  return (
    <section className="component-card">
      <p className="component-label">Field permissions</p>
      <div className="split-list">
        <span>Client phone edit: {clientCanEditPhone ? "allowed" : "blocked"}</span>
        <span>Client plan edit: {clientCanEditPlan ? "allowed" : "blocked"}</span>
      </div>
    </section>
  );
}

export function ProfileReviewQueuePanel() {
  const review = createProfileReviewItem({
    userId: previewUser.uid,
    field: "propertyAddress",
    proposedValue: "Updated service address"
  });

  return (
    <section className="component-card">
      <p className="component-label">Profile review queue</p>
      <h2>{review.status}</h2>
      <p>{review.field}: manager review required.</p>
    </section>
  );
}

export function CustomFieldPanel() {
  const field = createCustomFieldDefinition({
    key: "preferredCrew",
    label: "Preferred crew",
    managerOnly: true
  });

  return (
    <section className="component-card">
      <p className="component-label">Custom fields</p>
      <h2>{field.status}</h2>
      <p>{field.label}: {field.type}</p>
    </section>
  );
}

export function AccountGroupPanel() {
  const group = createAccountGroup({
    groupId: "group-preview",
    name: "Preview Household",
    memberIds: [previewUser.uid, "delegate-preview"]
  });

  return (
    <section className="component-card">
      <p className="component-label">Account grouping</p>
      <h2>{group.type}</h2>
      <p>{group.memberIds.length} users grouped under one account.</p>
    </section>
  );
}

export function RetentionPolicyPanel() {
  const policy = createRetentionPolicy({ profileType: "client" });

  return (
    <section className="component-card">
      <p className="component-label">Data retention</p>
      <h2>{policy.archiveAfterDays} days</h2>
      <p>{policy.action} after the profile lifecycle closes.</p>
    </section>
  );
}

export function ImportMapperPanel() {
  const mapped = mapImportedProfile({
    name: "Imported Client",
    email: "Imported@Example.com",
    tags: "lead, residential"
  });

  return (
    <section className="component-card">
      <p className="component-label">Profile import mapper</p>
      <h2>{mapped.tags.length} tags</h2>
      <p>{mapped.displayName}: {mapped.email}</p>
    </section>
  );
}
