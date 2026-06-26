export default function NonstickFooter({
  brand = "Site Name",
  summary = "Short footer summary for the future client website.",
  groups = [],
  legalLinks = []
}) {
  return (
    <footer className="nonstick-footer">
      <div className="nonstick-footer-brand">
        <strong>{brand}</strong>
        <p>{summary}</p>
      </div>
      <div className="nonstick-footer-groups">
        {groups.map((group) => (
          <nav aria-label={group.label} key={group.label}>
            <strong>{group.label}</strong>
            {group.links.map((link) => (
              <a href={link.href} key={link.href}>{link.label}</a>
            ))}
          </nav>
        ))}
      </div>
      <div className="nonstick-footer-legal">
        <span>&copy; {new Date().getFullYear()} {brand}</span>
        <nav aria-label="Legal links">
          {legalLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
