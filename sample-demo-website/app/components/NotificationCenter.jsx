const notifications = [
  ["Invite accepted", "A new account completed setup."],
  ["Security event", "Unknown write attempt blocked."],
  ["Health check", "API route responded successfully."]
];

export default function NotificationCenter() {
  return (
    <section className="component-card">
      <p className="component-label">Notification center</p>
      <div className="notification-list">
        {notifications.map(([title, body]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
