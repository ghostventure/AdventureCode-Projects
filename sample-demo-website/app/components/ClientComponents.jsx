import {
  activityItems,
  appointmentSlots,
  clientFiles,
  clientRequestOptions,
  invoicePreviewItems,
  messagePreviewItems
} from "../../lib/component-data";

export function ClientProfileCard() {
  return (
    <section className="component-card">
      <p className="component-label">Client profile</p>
      <h2>Avery Coleman</h2>
      <p>Primary account, contact details, account status, and service preferences.</p>
      <div className="detail-grid">
        <span><strong>Active</strong> Account status</span>
        <span><strong>92%</strong> Profile complete</span>
        <span><strong>Manager</strong> Assigned review</span>
      </div>
      <div className="button-row">
        <button type="button">Preview edit</button>
        <button className="secondary-button" type="button">View audit</button>
      </div>
    </section>
  );
}

export function PropertyProfileCard() {
  return (
    <section className="component-card">
      <p className="component-label">Property profile</p>
      <h2>Residential account</h2>
      <p>Address, access notes, account contacts, and recurring service context.</p>
      <dl className="mini-definition-list">
        <div>
          <dt>Access</dt>
          <dd>Gate code, parking note, preferred entry point</dd>
        </div>
        <div>
          <dt>Contacts</dt>
          <dd>Primary client plus alternate authorized contact</dd>
        </div>
      </dl>
    </section>
  );
}

export function RequestFormPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Request form</p>
      <div className="segmented-control" aria-label="Request type options">
        {clientRequestOptions.map((option) => (
          <span className={option.active ? "segment-active" : ""} key={option.label}>
            <strong>{option.label}</strong>
            <small>{option.detail}</small>
          </span>
        ))}
      </div>
      <div className="form-stack">
        <label>
          Request type
          <input placeholder="Estimate, update, support..." />
        </label>
        <label>
          Notes
          <textarea placeholder="Client request details" />
        </label>
        <button type="button">Stage preview request</button>
      </div>
    </section>
  );
}

export function AppointmentSchedulerPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Appointment scheduler</p>
      <div className="slot-grid">
        {appointmentSlots.map((slot) => (
          <span key={`${slot.day}-${slot.time}`}>
            <strong>{slot.day}</strong>
            {slot.time}
            <small>{slot.status}</small>
          </span>
        ))}
      </div>
      <p className="microcopy">Slots are visual placeholders until a client calendar provider is selected.</p>
    </section>
  );
}

export function MessageThreadPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Message thread</p>
      <div className="message-stack">
        {messagePreviewItems.map((message) => (
          <span key={`${message.author}-${message.time}`}>
            <strong>{message.author}</strong>
            {message.body}
            <small>{message.time}</small>
          </span>
        ))}
      </div>
      <div className="button-row">
        <button type="button">Preview reply</button>
        <button className="secondary-button" type="button">Attach note</button>
      </div>
    </section>
  );
}

export function InvoiceStatusPanel() {
  return (
    <section className="component-card">
      <p className="component-label">Invoice status</p>
      <h2>Billing surface disabled</h2>
      <p>Payment state, balance visibility, and receipt handoff can be shown without enabling billing.</p>
      <div className="split-list">
        {invoicePreviewItems.map((item) => (
          <span key={item.label}>
            <strong>{item.label}</strong>
            {item.amount}
            <small>{item.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function DocumentListPreview() {
  return (
    <section className="component-card">
      <p className="component-label">Documents</p>
      <div className="split-list">
        {clientFiles.map((file) => (
          <span key={file.name}>
            <strong>{file.name}</strong>
            {file.type}
            <small>{file.status}</small>
          </span>
        ))}
      </div>
    </section>
  );
}

export function MaintenanceHistoryTimeline() {
  return (
    <section className="component-card">
      <p className="component-label">History timeline</p>
      <div className="timeline">
        {activityItems.map((item) => (
          <div key={item.label}>
            <strong>{item.label}</strong>
            <span>{item.time}</span>
            <p>{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
