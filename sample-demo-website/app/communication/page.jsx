import ComponentGrid from "../components/ComponentGrid";
import {
  CommunicationOverview,
  ConversationPanel,
  DeliveryReceiptPanel,
  EmailTemplatePanel,
  MessageComposerPanel,
  NotificationTemplatePanel,
  StatusUpdatePanel,
  WebhookEventPanel
} from "../components/CommunicationComponents";
import NotificationCenter from "../components/NotificationCenter";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Communication | Sample Demo Website",
  description: "Reusable communication infrastructure for future websites."
};

export default function CommunicationPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Communication" }]}
      eyebrow="Communication"
      title="Communication components are installed."
      description="This layer covers reusable messaging, notifications, email queues, webhook intake, delivery receipts, and status updates."
    >
      <ComponentGrid>
        <CommunicationOverview />
        <ConversationPanel />
        <MessageComposerPanel />
        <NotificationCenter />
        <NotificationTemplatePanel />
        <EmailTemplatePanel />
        <StatusUpdatePanel />
        <WebhookEventPanel />
        <DeliveryReceiptPanel />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
