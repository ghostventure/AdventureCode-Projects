import Breadcrumbs from "./Breadcrumbs";

export default function WorkspaceLayout({ title, eyebrow, description, breadcrumbs, aside, children }) {
  return (
    <main className="workspace-page">
      <Breadcrumbs items={breadcrumbs} />
      <section className="workspace-hero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {aside ? <aside className="workspace-aside">{aside}</aside> : null}
      </section>
      {children}
    </main>
  );
}
