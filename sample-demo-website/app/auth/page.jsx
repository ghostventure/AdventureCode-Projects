import AuthShell from "../components/AuthShell";
import {
  AuthAccountOverview,
  AuthErrorMapperPanel,
  ClaimsSyncPanel,
  DeviceSessionPanel,
  EmailVerificationPanel,
  InviteAcceptancePanel,
  LoginHistoryPanel,
  MfaPasskeyPanel,
  OnboardingChecklistPanel,
  PasswordChangePanel,
  ReauthGatePanel
} from "../components/AuthAccountComponents";
import AuthAdapterPanel from "../components/AuthAdapterPanel";
import CommandMenuPreview from "../components/CommandMenuPreview";
import ComponentGrid from "../components/ComponentGrid";
import { EmptyState, ErrorState, LoadingSkeletons, ModalDrawerPreview, ToastStack } from "../components/FeedbackComponents";
import RoleRouterPanel from "../components/RoleRouterPanel";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Auth Components | Sample Demo Website",
  description: "Installed account access and UX state components."
};

export default function AuthPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Auth" }]}
      eyebrow="Access components"
      title="Auth and UX state components are installed."
      description="The top section is a basic sign-in and sign-up placeholder. The remaining panels show the reusable Firebase Auth and account lifecycle pieces."
    >
      <AuthShell />
      <ComponentGrid>
        <AuthAdapterPanel />
        <AuthAccountOverview />
        <EmailVerificationPanel />
        <PasswordChangePanel />
        <MfaPasskeyPanel />
        <DeviceSessionPanel />
        <LoginHistoryPanel />
        <ClaimsSyncPanel />
        <InviteAcceptancePanel />
        <OnboardingChecklistPanel />
        <ReauthGatePanel />
        <AuthErrorMapperPanel />
        <RoleRouterPanel />
        <CommandMenuPreview />
        <ToastStack />
        <ModalDrawerPreview />
        <LoadingSkeletons />
        <EmptyState />
        <ErrorState />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
