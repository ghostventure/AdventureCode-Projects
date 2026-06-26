export default function NonstickLayoutShell({ title = "Page title", intro, asideTitle = "Page details", aside, children }) {
  return (
    <section className="nonstick-layout-shell">
      <header className="nonstick-layout-header">
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
      </header>
      <div className="nonstick-layout-grid">
        <main className="nonstick-layout-main">{children}</main>
        <aside className="nonstick-layout-aside" aria-label={asideTitle}>
          {aside}
        </aside>
      </div>
    </section>
  );
}
