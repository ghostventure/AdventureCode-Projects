"use client";

import Link from "next/link";
import { Menu, Sprout, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { primaryNavItems } from "../../lib/navigation";
import { canRoleAccessPath, isPublicPath } from "../../lib/route-access-policy";
import { useSessionSignal } from "./SessionProvider";
import SessionStatus from "./SessionStatus";
import ThemeToggle from "./ThemeToggle";

export default function TopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, role } = useSessionSignal();
  const visibleNavItems = primaryNavItems.filter((item) => (
    isPublicPath(item.href) || (isAuthenticated && canRoleAccessPath(role, item.href))
  ));

  return (
    <header className="top-nav">
      <Link className="brand-link" href="/" onClick={() => setIsOpen(false)}>
        <span className="brand-icon" aria-hidden="true">
          <Sprout size={21} strokeWidth={2.2} />
        </span>
        <span>
          <strong>Home Services</strong>
          <small>Service marketplace</small>
        </span>
      </Link>

      <button
        aria-controls="primary-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        className="nav-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
      </button>

      <SessionStatus />

      <ThemeToggle />

      <nav
        className={`nav-menu${isOpen ? " nav-menu-open" : ""}`}
        id="primary-navigation"
        aria-label="Primary navigation"
      >
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`nav-link${isActive ? " nav-link-active" : ""}`}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
              title={item.description}
            >
              <Icon size={17} strokeWidth={2.2} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
