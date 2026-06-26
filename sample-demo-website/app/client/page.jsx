import {
  AppointmentSchedulerPreview,
  ClientProfileCard,
  DocumentListPreview,
  InvoiceStatusPanel,
  MaintenanceHistoryTimeline,
  MessageThreadPreview,
  PropertyProfileCard,
  RequestFormPreview
} from "../components/ClientComponents";
import ComponentGrid from "../components/ComponentGrid";
import FileUploadPreview from "../components/FileUploadPreview";
import FileStoragePanel from "../components/FileStoragePanel";
import {
  ArchiveHistoryPanel,
  ClientDashboardSummaryPanel,
  ClientOnboardingWizardPanel,
  DocumentSignaturePanel,
  EmptyStateVariantsPanel,
  FormStateVariantsPanel,
  MediaGalleryPanel,
  MobilePreviewPanel,
  NotificationPreferencesPanel,
  PrintExportPreviewPanel,
  RoleEmptyStatesPanel,
  ServiceCatalogPanel,
  ServicePackagePanel,
  SupportTicketPanel
} from "../components/LeasingTemplateComponents";
import NotificationCenter from "../components/NotificationCenter";
import StatusCard from "../components/StatusCard";
import WorkspaceLayout from "../components/WorkspaceLayout";

export const metadata = {
  title: "Client Components | Sample Demo Website",
  description: "Installed client workspace components."
};

export default function ClientPage() {
  return (
    <WorkspaceLayout
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Client" }]}
      eyebrow="Client workspace"
      title="Client account components are installed."
      description="These components cover homeowner profiles, service requests, appointments, messaging, estimates, files, and service history before a final client brand is selected."
      aside={<StatusCard label="Client modules" value="15" detail="Ready for data wiring" />}
    >
      <ClientDashboardSummaryPanel />
      <ComponentGrid>
        <ClientOnboardingWizardPanel />
        <MobilePreviewPanel />
        <ClientProfileCard />
        <PropertyProfileCard />
        <ServiceCatalogPanel />
        <ServicePackagePanel />
        <RequestFormPreview />
        <AppointmentSchedulerPreview />
        <MessageThreadPreview />
        <NotificationCenter />
        <NotificationPreferencesPanel />
        <InvoiceStatusPanel />
        <DocumentListPreview />
        <DocumentSignaturePanel />
        <MediaGalleryPanel />
        <SupportTicketPanel />
        <FormStateVariantsPanel />
        <EmptyStateVariantsPanel />
        <RoleEmptyStatesPanel />
        <PrintExportPreviewPanel />
        <ArchiveHistoryPanel />
        <FileUploadPreview />
        <FileStoragePanel />
        <MaintenanceHistoryTimeline />
      </ComponentGrid>
    </WorkspaceLayout>
  );
}
