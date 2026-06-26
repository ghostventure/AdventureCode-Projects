import Link from "next/link";
import { primaryNavItems } from "../../lib/navigation";

export default function NavOverview() {
  return (
    <section className="nav-overview" aria-label="Platform navigation overview">
      {primaryNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link className="nav-overview-item" href={item.href} key={item.href}>
            <span className="nav-overview-icon" aria-hidden="true">
              <Icon size={19} strokeWidth={2.2} />
            </span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </Link>
        );
      })}
    </section>
  );
}
