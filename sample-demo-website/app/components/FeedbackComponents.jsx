export function ToastStack() {
  return (
    <section className="component-card">
      <p className="component-label">Toast notifications</p>
      <div className="toast-stack">
        <span>Account saved</span>
        <span>Manager review required</span>
        <span>Upload complete</span>
      </div>
    </section>
  );
}

export function ModalDrawerPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Modal and drawer</p>
      <div className="drawer-preview">
        <strong>Confirm sensitive action</strong>
        <p>Reusable confirmation surface for status changes, deletes, and account actions.</p>
      </div>
    </section>
  );
}

export function LoadingSkeletons() {
  return (
    <section className="component-card">
      <p className="component-label">Loading states</p>
      <div className="skeleton-lines">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

export function EmptyState() {
  return (
    <section className="component-card">
      <p className="component-label">Empty state</p>
      <h2>No records yet</h2>
      <p>Reusable state for empty directories, files, messages, and schedules.</p>
    </section>
  );
}

export function ErrorState() {
  return (
    <section className="component-card danger-card">
      <p className="component-label">Error boundary</p>
      <h2>Something needs review</h2>
      <p>Fallback surface for failed data loads, unavailable services, and permission errors.</p>
    </section>
  );
}
