export default function NonstickSectionIndex({ sections = [] }) {
  return (
    <nav className="nonstick-section-index" aria-label="Page sections">
      {sections.map((section) => (
        <a href={`#${section.id}`} key={section.id}>
          {section.label}
        </a>
      ))}
    </nav>
  );
}
