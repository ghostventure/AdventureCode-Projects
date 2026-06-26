import {
  createApprovalRequest,
  createAutomationRule,
  createDataJob,
  createReportDefinition,
  createWorkflowItem,
  dataCollections,
  transitionWorkflow,
  workflowStatuses
} from "../../lib/data-workflow";
import { createExportManifest } from "../../lib/backup-export";

export function DataCollectionsPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Data collections</p>
      <div className="split-list">
        {dataCollections.map((collection) => (
          <span key={collection.key}>
            <strong>{collection.key}</strong>
            Owner: {collection.owner}
            <small>{collection.sensitive ? "Sensitive" : "Standard"} collection</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function WorkflowStatePanel() {
  return (
    <section className="component-card">
      <p className="component-label">Workflow states</p>
      <div className="pipeline pipeline-stacked">
        {workflowStatuses.map((status, index) => (
          <span key={status}>
            <strong>{index + 1}</strong>
            {status}
          </span>
        ))}
      </div>
    </section>
  );
}

export function WorkflowTransitionPanel() {
  const item = createWorkflowItem({ title: "Preview work item", ownerId: "manager-preview" });
  const result = transitionWorkflow(item, "triage", "manager-preview");

  return (
    <section className="component-card">
      <p className="component-label">State transitions</p>
      <h2>{result.ok ? result.item.status : "blocked"}</h2>
      <p>Workflow transitions are constrained by the shared state machine.</p>
      <div className="detail-grid">
        <span><strong>{item.status}</strong> Previous</span>
        <span><strong>{result.item.status}</strong> Next</span>
        <span><strong>{result.event ? 1 : 0}</strong> Audit events</span>
      </div>
    </section>
  );
}

export function ApprovalPanel() {
  const approval = createApprovalRequest({
    targetId: "work-preview",
    requestedBy: "client-preview",
    approverId: "manager-preview",
    summary: "Approve workflow handoff."
  });

  return (
    <section className="component-card">
      <p className="component-label">Approvals</p>
      <h2>{approval.status}</h2>
      <p>{approval.summary}</p>
      <dl className="mini-definition-list">
        <div>
          <dt>Requested by</dt>
          <dd>{approval.requestedBy}</dd>
        </div>
        <div>
          <dt>Approver</dt>
          <dd>{approval.approverId}</dd>
        </div>
      </dl>
    </section>
  );
}

export function DataJobPanel() {
  const importJob = createDataJob({ type: "import", collection: "requests", requestedBy: "manager-preview" });
  const exportManifest = createExportManifest({ requestedBy: "manager-preview" });

  return (
    <section className="component-card">
      <p className="component-label">Import/export jobs</p>
      <h2>{importJob.status}</h2>
      <p>{exportManifest.collections.length} collections are ready for export manifests.</p>
      <div className="split-list">
        <span><strong>Import</strong>{importJob.collection}</span>
        <span><strong>Export</strong>{exportManifest.collections.join(", ")}</span>
        <span><strong>Storage</strong>Provider selected per leased client</span>
      </div>
    </section>
  );
}

export function AutomationPanel() {
  const automation = createAutomationRule({
    trigger: "request.created",
    action: "notify.manager"
  });

  return (
    <section className="component-card">
      <p className="component-label">Automation rules</p>
      <h2>{automation.enabled ? "enabled" : "disabled"}</h2>
      <p>{automation.trigger} to {automation.action}</p>
      <div className="button-row">
        <button type="button">Preview rule</button>
        <button className="secondary-button" type="button">Disable</button>
      </div>
    </section>
  );
}

export function ReportingPanel() {
  const report = createReportDefinition({
    name: "Workflow summary",
    collection: "workItems",
    metrics: ["count", "cycleTime", "status"]
  });

  return (
    <section className="component-card">
      <p className="component-label">Reports</p>
      <h2>{report.status}</h2>
      <p>{report.name}: {report.metrics.join(", ")}</p>
      <div className="detail-grid">
        <span><strong>{report.collection}</strong> Source</span>
        <span><strong>{report.metrics.length}</strong> Metrics</span>
      </div>
    </section>
  );
}
