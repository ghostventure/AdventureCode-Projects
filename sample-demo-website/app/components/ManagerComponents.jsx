import { estimateLineItems, leadQueueItems, pipelineItems, taskItems } from "../../lib/component-data";

export function ManagerDashboardSummary() {
  return (
    <section className="component-card">
      <p className="component-label">Manager dashboard</p>
      <div className="mini-stats">
        <span><strong>8</strong> New</span>
        <span><strong>5</strong> Reviews</span>
        <span><strong>4</strong> Scheduled</span>
      </div>
      <div className="meter-list">
        <span><strong style={{ width: "72%" }} /> Intake capacity</span>
        <span><strong style={{ width: "48%" }} /> Review queue</span>
      </div>
    </section>
  );
}

export function DirectoryFilters() {
  return (
    <section className="component-card">
      <p className="component-label">Directory filters</p>
      <div className="filter-row">
        <span>Role</span>
        <span>Status</span>
        <span>Manager</span>
        <span>Date</span>
      </div>
      <div className="form-stack">
        <label>
          Search directory
          <input placeholder="Name, email, account, tag..." />
        </label>
      </div>
    </section>
  );
}

export function LeadIntakeQueue() {
  return (
    <section className="component-card">
      <p className="component-label">Lead intake queue</p>
      <div className="split-list">
        {leadQueueItems.map((item) => (
          <span key={item.title}>
            <strong>{item.title}</strong>
            {item.meta}
            <small>{item.priority} priority</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function EstimateBuilderPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Estimate builder</p>
      <h2>Scope summary</h2>
      <p>Line items, notes, customer approval state, and internal review controls.</p>
      <div className="split-list">
        {estimateLineItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.value}
          </span>
        ))}
      </div>
      <div className="button-row">
        <button type="button">Preview estimate</button>
        <button className="secondary-button" type="button">Save draft</button>
      </div>
    </section>
  );
}

export function JobSchedulerPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Job scheduler</p>
      <div className="slot-grid">
        <span><strong>Assigned</strong> 6 jobs<small>Today</small></span>
        <span><strong>Pending</strong> 3 holds<small>Needs confirmation</small></span>
        <span><strong>Completed</strong> 12 jobs<small>This week</small></span>
        <span><strong>Blocked</strong> 1 item<small>Missing approval</small></span>
      </div>
    </section>
  );
}

export function CrewAssignmentBoard() {
  return (
    <section className="component-card">
      <p className="component-label">Assignment board</p>
      <div className="pipeline pipeline-stacked">
        {pipelineItems.map((item) => (
          <span key={item.label}>
            <strong>{item.count}</strong>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function TaskChecklist() {
  return (
    <section className="component-card">
      <p className="component-label">Task checklist</p>
      <ul className="check-list compact-list">
        {taskItems.map((task) => (
          <li key={task}>{task}</li>
        ))}
      </ul>
    </section>
  );
}

export function StatusPipeline() {
  return (
    <section className="component-card">
      <p className="component-label">Status pipeline</p>
      <div className="pipeline pipeline-stacked">
        {pipelineItems.map((item) => (
          <span key={item.label}>
            <strong>{item.count}</strong>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

export function ActivityLogPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Notes and activity</p>
      <div className="timeline">
        <div>
          <strong>Manager note added</strong>
          <span>Today</span>
          <p>Follow-up details saved for the account.</p>
        </div>
        <div>
          <strong>Client-facing update staged</strong>
          <span>Yesterday</span>
          <p>Preview message is saved locally until a communication provider is configured.</p>
        </div>
        <div>
          <strong>Assignment changed</strong>
          <span>This week</span>
          <p>Queue ownership moved from unassigned to manager review.</p>
        </div>
      </div>
    </section>
  );
}

export function PermissionManagementPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Permissions</p>
      <div className="split-list">
        <span><strong>Client</strong> Self-read and self-update draft fields</span>
        <span><strong>Manager</strong> Account control and workflow moderation</span>
        <span><strong>Archived</strong> Access lockout with audit history retained</span>
      </div>
    </section>
  );
}
