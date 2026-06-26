const footerGroups = [
  {
    label: "Boilerplates",
    links: [
      { href: "/", label: "Layout shell" },
      { href: "/", label: "Footer starter" },
      { href: "/", label: "Compact footer" }
    ]
  },
  {
    label: "Template",
    links: [
      { href: "/platform", label: "Platform" },
      { href: "/security", label: "Security" },
      { href: "/health", label: "Health" }
    ]
  },
  {
    label: "Policy",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/data-request", label: "Data Request" }
    ]
  }
];

export default function GlobalNonstickFooter() {
  return (
    <footer className="global-nonstick-footer" aria-label="Global non-stick footer boilerplate preview">
      <div className="global-nonstick-footer-brand">
        <p className="component-label">Footer boilerplates</p>
        <h2>Global non-stick footer starters are installed.</h2>
        <p>
          These footer patterns stay in normal document flow and are ready to
          copy into future client pages without sticky or fixed positioning.
        </p>
      </div>
      <div className="global-nonstick-footer-groups">
        {footerGroups.map((group) => (
          <nav aria-label={group.label} key={group.label}>
            <strong>{group.label}</strong>
            {group.links.map((link) => (
              <a href={link.href} key={`${group.label}-${link.label}`}>{link.label}</a>
            ))}
          </nav>
        ))}
      </div>
      <div className="global-nonstick-footer-legal">
        <span>NonstickFooter + NonstickCompactFooter</span>
        <nav aria-label="Footer legal boilerplate links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
