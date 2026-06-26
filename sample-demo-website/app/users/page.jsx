import UserDirectory from "../components/UserDirectory";
import ComponentGrid from "../components/ComponentGrid";
import {
  AccountActivityPanel,
  AddressBookPanel,
  AlternateContactPanel,
  AvatarPanel,
  BillingProfilePanel,
  ContactPreferencesPanel,
  AccountGroupPanel,
  DelegatedAccessPanel,
  DuplicateDetectionPanel,
  CustomFieldPanel,
  FieldPermissionPanel,
  IdentityStatusPanel,
  ImportMapperPanel,
  ManagerAssignmentPanel,
  ProfileAttachmentPanel,
  ProfileCompletionPanel,
  ProfilePrivacyPanel,
  ProfileReviewQueuePanel,
  ProfileVersionPanel,
  RetentionPolicyPanel,
  TagsSegmentsPanel
} from "../components/UserProfileComponents";
import {
  ArchiveHistoryPanel,
  DataRetentionControlsPanel,
  RoleEmptyStatesPanel
} from "../components/LeasingTemplateComponents";
import UserStatGrid from "../components/UserStatGrid";
import {
  getUserCounts,
  getUsersByRole,
  sampleUsers,
  USER_ROLES,
  userFields
} from "../../lib/user-database";

export const metadata = {
  title: "User Database | Sample Demo Website",
  description: "Client and manager user database foundation for the sample home services platform."
};

export default function UsersPage() {
  const counts = getUserCounts(sampleUsers);
  const clients = getUsersByRole(USER_ROLES.CLIENT, sampleUsers);
  const managers = getUsersByRole(USER_ROLES.MANAGER, sampleUsers);

  return (
    <main className="users-page">
      <section className="users-hero">
        <p className="eyebrow">User database</p>
        <h1>Client and manager accounts are modeled separately.</h1>
        <p>
          This foundation keeps homeowners, property details, service plans, and
          manager operating scope in one role-aware Firestore-ready structure.
        </p>
      </section>

      <UserStatGrid counts={counts} />

      <section className="directory-section">
        <div className="directory-heading">
          <h2>User profile components</h2>
          <p>Reusable profile pieces for onboarding, identity, preferences, privacy, attachments, assignments, and admin cleanup.</p>
        </div>
        <ComponentGrid>
          <ProfileCompletionPanel />
          <AvatarPanel />
          <ContactPreferencesPanel />
          <AddressBookPanel />
          <AlternateContactPanel />
          <BillingProfilePanel />
          <IdentityStatusPanel />
          <AccountActivityPanel />
          <ProfilePrivacyPanel />
          <ProfileAttachmentPanel />
          <ManagerAssignmentPanel />
          <TagsSegmentsPanel />
          <DuplicateDetectionPanel />
          <DelegatedAccessPanel />
          <ProfileVersionPanel />
          <FieldPermissionPanel />
          <ProfileReviewQueuePanel />
          <CustomFieldPanel />
          <AccountGroupPanel />
          <RetentionPolicyPanel />
          <ImportMapperPanel />
          <RoleEmptyStatesPanel />
          <ArchiveHistoryPanel />
          <DataRetentionControlsPanel />
        </ComponentGrid>
      </section>

      <UserDirectory
        title="Client records"
        description="Clients hold service plans, property context, onboarding state, and contact details."
        users={clients}
      />

      <UserDirectory
        title="Manager records"
        description="Managers hold operational scope for estimates, scheduling, intake, and account reviews."
        users={managers}
      />

      <section className="schema-section">
        <div className="directory-heading">
          <h2>Database fields</h2>
          <p>These fields are the starting contract for Firestore user documents.</p>
        </div>
        <div className="schema-grid">
          {Object.entries(userFields).map(([field, description]) => (
            <div className="schema-row" key={field}>
              <code>{field}</code>
              <span>{description}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
