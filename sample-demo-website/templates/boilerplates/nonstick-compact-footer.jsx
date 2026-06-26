export default function NonstickCompactFooter({ brand = "Site Name", links = [] }) {
  return (
    <footer className="nonstick-compact-footer">
      <span>&copy; {new Date().getFullYear()} {brand}</span>
      <nav aria-label="Footer links">
        {links.map((link) => (
          <a href={link.href} key={link.href}>{link.label}</a>
        ))}
      </nav>
    </footer>
  );
}
