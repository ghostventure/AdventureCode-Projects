import Link from "next/link";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.href || item.label}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <span className="breadcrumb-separator">/</span> : null}
        </span>
      ))}
    </nav>
  );
}
