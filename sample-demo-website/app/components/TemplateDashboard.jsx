import Link from "next/link";
import { guiApiLinks, guiModuleGroups, guiSummaryStats } from "../../lib/gui-layer";

export default function TemplateDashboard() {
  return (
    <section className="template-dashboard" aria-label="Template GUI placeholder">
      <div className="dashboard-stats" aria-label="Template status summary">
        {guiSummaryStats.map((stat) => (
          <article className="dashboard-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>

      <div className="dashboard-groups">
        {guiModuleGroups.map((group) => (
          <section className="dashboard-group" key={group.title}>
            <h2>{group.title}</h2>
            <div className="dashboard-link-list">
              {group.links.map((link) => (
                <Link className="dashboard-link" href={link.href} key={link.href}>
                  <strong>{link.label}</strong>
                  <span>{link.detail}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="dashboard-api-strip" aria-label="Preview API shortcuts">
        <div>
          <p className="component-label">API previews</p>
          <p>Quick links for basic JSON endpoints used by smoke tests and placeholder panels.</p>
        </div>
        <div className="dashboard-api-links">
          {guiApiLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
