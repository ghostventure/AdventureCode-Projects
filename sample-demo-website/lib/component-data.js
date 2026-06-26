export const activityItems = [
  { label: "Client profile updated", time: "Today 9:42 AM", detail: "Contact, access notes, and preferred service window were reviewed." },
  { label: "Estimate request received", time: "Yesterday 4:18 PM", detail: "Manager follow-up is waiting in the queue with three attached photos." },
  { label: "Document added", time: "This week", detail: "Client uploaded supporting project photos and signed service terms." },
  { label: "Appointment window held", time: "Last week", detail: "A tentative morning slot was reserved pending manager confirmation." }
];

export const pipelineItems = [
  { label: "New lead", count: 8 },
  { label: "Review", count: 5 },
  { label: "Scheduled", count: 4 },
  { label: "Closed", count: 11 }
];

export const taskItems = [
  "Review new account invitations",
  "Assign manager follow-up",
  "Confirm appointment availability",
  "Attach internal notes before approval",
  "Close completed client request"
];

export const auditEvents = [
  { label: "Manager read access checked", status: "allowed" },
  { label: "Unknown write path", status: "blocked" },
  { label: "Client self-read", status: "allowed" },
  { label: "Unsigned database request", status: "blocked" },
  { label: "Idle session sign-out", status: "recorded" },
  { label: "Content revision export", status: "queued" }
];

export const clientFiles = [
  { name: "Project photos", type: "Image set", status: "Uploaded" },
  { name: "Signed agreement", type: "PDF", status: "Accepted" },
  { name: "Invoice copy", type: "PDF", status: "Visible" },
  { name: "Access notes", type: "Text", status: "Manager only" }
];

export const clientRequestOptions = [
  { label: "Estimate", detail: "New scoped request", active: true },
  { label: "Update", detail: "Existing project note", active: false },
  { label: "Support", detail: "Account or document help", active: false }
];

export const appointmentSlots = [
  { day: "Mon", time: "9:00 AM", status: "Open" },
  { day: "Tue", time: "1:30 PM", status: "Held" },
  { day: "Thu", time: "3:00 PM", status: "Open" },
  { day: "Fri", time: "10:30 AM", status: "Manager review" }
];

export const messagePreviewItems = [
  { author: "Client", body: "Can we review the next steps before the appointment?", time: "8:40 AM" },
  { author: "Manager", body: "Yes. I can prepare options and hold the earliest slot.", time: "8:48 AM" },
  { author: "System", body: "Preview notification queued, no provider call sent.", time: "8:49 AM" }
];

export const invoicePreviewItems = [
  { label: "Draft estimate", amount: "$0.00", status: "Preview only" },
  { label: "Deposit request", amount: "Disabled", status: "Billing not installed" },
  { label: "Receipt handoff", amount: "Ready", status: "Visual placeholder" }
];

export const leadQueueItems = [
  { title: "New client request", meta: "Needs manager review", priority: "High" },
  { title: "Account invite pending", meta: "Expires in 3 days", priority: "Medium" },
  { title: "Manager review needed", meta: "Awaiting scope notes", priority: "Medium" },
  { title: "Document approval", meta: "Agreement uploaded", priority: "Low" }
];

export const estimateLineItems = [
  { label: "Scope block", value: "3 sections" },
  { label: "Internal notes", value: "2 comments" },
  { label: "Client approval", value: "Not requested" }
];

export const servicePackages = [
  { name: "Starter service", cadence: "One-time", status: "Visible", detail: "Entry package placeholder for the leasing client's first offer." },
  { name: "Recurring care", cadence: "Monthly", status: "Featured", detail: "Reusable subscription-style card without billing activation." },
  { name: "Custom project", cadence: "Scoped", status: "Manager review", detail: "Flexible request type for client-specific services." }
];

export const quoteReviewItems = [
  { label: "Scope", value: "3 service blocks", status: "Ready" },
  { label: "Terms", value: "Visual acknowledgement", status: "Pending" },
  { label: "Approval", value: "Client action", status: "Preview only" }
];

export const onboardingSteps = [
  { label: "Account", status: "Complete" },
  { label: "Property", status: "Complete" },
  { label: "Contacts", status: "Needs review" },
  { label: "Documents", status: "Optional" },
  { label: "First request", status: "Ready" }
];

export const supportTicketItems = [
  { label: "Category", value: "Scheduling question" },
  { label: "Priority", value: "Normal" },
  { label: "Status", value: "Open preview" },
  { label: "Owner", value: "Assigned manager" }
];

export const mediaGalleryItems = [
  { label: "Front area", type: "Photo", status: "Reviewed" },
  { label: "Access point", type: "Photo", status: "Needs tag" },
  { label: "Before set", type: "Gallery", status: "Client visible" },
  { label: "Manager notes", type: "Markup", status: "Internal" }
];

export const tenantBrandSettings = [
  { label: "Logo", value: "Upload slot" },
  { label: "Brand colors", value: "Primary and accent" },
  { label: "Business info", value: "Name, phone, service area" },
  { label: "Module labels", value: "Client-specific wording" }
];

export const demoJourneySteps = [
  { label: "Client signs in", detail: "Account shell, role routing, session timer" },
  { label: "Profile reviewed", detail: "Contact, property, documents, preferences" },
  { label: "Request staged", detail: "Service package, quote review, media, support" },
  { label: "Manager follows up", detail: "Queue, assignment, status update, notes" },
  { label: "Client sees progress", detail: "Timeline, notifications, documents, approval state" }
];

export const clientDashboardSummary = [
  { label: "Next action", value: "Review quote", detail: "Client approval preview is waiting." },
  { label: "Upcoming", value: "Tue 1:30", detail: "Appointment slot is held visually." },
  { label: "Recent", value: "3 updates", detail: "Messages, media, and document activity." }
];

export const managerCommandSummary = [
  { label: "Intake", value: "8", detail: "New requests and invites." },
  { label: "Approvals", value: "3", detail: "Quotes, documents, access changes." },
  { label: "Support", value: "2", detail: "Open client support cases." },
  { label: "Schedule", value: "4", detail: "Held or assigned appointments." }
];

export const leaseSetupChecklist = [
  { label: "Brand set", status: "Ready" },
  { label: "Services set", status: "Needs client input" },
  { label: "Legal copy set", status: "Placeholder" },
  { label: "Provider APIs", status: "Disabled by default" },
  { label: "Demo data", status: "Loaded" }
];

export const moduleMatrixItems = [
  { label: "Client portal", enabled: true },
  { label: "Manager workspace", enabled: true },
  { label: "Billing", enabled: false },
  { label: "Email provider", enabled: false },
  { label: "SMS provider", enabled: false },
  { label: "Support tickets", enabled: true },
  { label: "Media gallery", enabled: true },
  { label: "Quote approval", enabled: true }
];

export const formStateVariants = [
  { label: "Submitted", detail: "Saved preview state", tone: "Ready" },
  { label: "Draft", detail: "Local placeholder saved", tone: "Draft" },
  { label: "Warning", detail: "Required field missing", tone: "Review" },
  { label: "Blocked", detail: "Provider not connected", tone: "Disabled" }
];

export const emptyStateVariants = [
  { label: "No documents", detail: "Show upload prompt" },
  { label: "No messages", detail: "Show starter composer" },
  { label: "No appointments", detail: "Show schedule picker" },
  { label: "No requests", detail: "Show service catalog" }
];

export const mobilePreviewItems = [
  { label: "Dashboard card", detail: "Single-column summary" },
  { label: "Queue item", detail: "Compact status row" },
  { label: "Onboarding step", detail: "Tap-friendly progress" },
  { label: "Action tray", detail: "Primary and secondary controls" }
];

export const seedScenarios = [
  { label: "New client", detail: "Onboarding and first request" },
  { label: "Active client", detail: "Appointment, media, quote review" },
  { label: "Manager review", detail: "Intake and approval queue" },
  { label: "Support case", detail: "Ticket, thread, status update" }
];

export const deploymentStatusItems = [
  { label: "Local", value: "Running", detail: "http://127.0.0.1:3012" },
  { label: "Build", value: "Passing", detail: "Next production build succeeds" },
  { label: "Live", value: "Deployed", detail: "Static Firebase Hosting visual demo is live" }
];

export const componentInventoryGroups = [
  { label: "Client", value: "Profile, requests, services, files, support" },
  { label: "Manager", value: "Intake, approvals, schedule, assignments" },
  { label: "Platform", value: "Flags, legal, exports, environment" },
  { label: "Security", value: "Rules, audit, roles, session controls" }
];

export const componentMetadataItems = [
  { label: "Purpose", value: "Prove the installed surface exists" },
  { label: "Mode", value: "Visual placeholder, provider-free" },
  { label: "Lease path", value: "Rename, brand, wire data, deploy" }
];

export const clientLeasePresets = [
  { label: "Home services", detail: "Requests, appointments, media, quote approval" },
  { label: "Consulting", detail: "Documents, scheduling, support, approvals" },
  { label: "Maintenance", detail: "Recurring services, history, manager review" },
  { label: "Field service", detail: "Dispatch, media, status updates, files" }
];

export const themePresetSwatches = [
  { label: "Forest", colors: ["#2f6245", "#f6f4ee", "#17211d"] },
  { label: "Civic", colors: ["#264653", "#f4f7f8", "#1d3557"] },
  { label: "Studio", colors: ["#3d405b", "#f7f4ef", "#81b29a"] },
  { label: "Field", colors: ["#386641", "#f2e8cf", "#bc4749"] }
];

export const roleEmptyStates = [
  { label: "Client", detail: "No requests yet, show services" },
  { label: "Manager", detail: "No queue items, show intake setup" },
  { label: "Admin", detail: "No audit events, show security baseline" }
];

export const printExportPreviewItems = [
  { label: "Quote packet", detail: "Print-ready visual state" },
  { label: "Client summary", detail: "Download placeholder" },
  { label: "Audit export", detail: "Admin-only preview" }
];

export const archiveHistoryItems = [
  { label: "Closed request", detail: "Archived with timeline" },
  { label: "Resolved ticket", detail: "Support history retained" },
  { label: "Old document", detail: "Visible by retention policy" }
];

export const helpFaqItems = [
  { label: "How do I request service?", detail: "Use service catalog or request form." },
  { label: "Can I upload files?", detail: "Upload surface is installed; storage wires per client." },
  { label: "Why is billing disabled?", detail: "Billing is intentionally omitted from template mode." }
];

export const legalReviewItems = [
  { label: "Privacy", detail: "Needs client owner review" },
  { label: "Terms", detail: "Placeholder copy installed" },
  { label: "Data requests", detail: "Route and intake are installed" }
];

export const dataRetentionControls = [
  { label: "Profile archive", detail: "1095-day visual policy" },
  { label: "Delete window", detail: "2555-day visual policy" },
  { label: "Export format", detail: "JSONL manifest preview" }
];

export const templateComparisonItems = [
  { label: "Template mode", value: "Visual placeholders, local preview, no providers" },
  { label: "Leased mode", value: "Client brand, real content, selected integrations" },
  { label: "Custom mode", value: "Provider wiring, workflows, deployment support" }
];

export const walkthroughSteps = [
  { label: "1", detail: "Open dashboard story" },
  { label: "2", detail: "Review client portal" },
  { label: "3", detail: "Stage request and quote" },
  { label: "4", detail: "Inspect manager follow-up" },
  { label: "5", detail: "Confirm launch checklist" }
];

export const loadingVariantItems = [
  { label: "Client card", detail: "Profile shimmer" },
  { label: "Queue", detail: "Manager row shimmer" },
  { label: "Table", detail: "Data skeleton" },
  { label: "Message", detail: "Thread loading state" }
];

export const mobileNavigationStates = [
  { label: "Closed", detail: "Compact top bar" },
  { label: "Open", detail: "Stacked route drawer" },
  { label: "Action tray", detail: "Primary task controls" }
];

export const errorRecoveryVariants = [
  { label: "Expired session", detail: "Return to sign-in prompt" },
  { label: "Failed upload", detail: "Retry when storage is configured" },
  { label: "Unavailable provider", detail: "Explain provider is disabled" },
  { label: "Missing permission", detail: "Show role-aware access message" }
];
