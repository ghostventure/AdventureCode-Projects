import {
  ClipboardList,
  DatabaseZap,
  ListChecks,
  MessagesSquare,
  Home,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  HeartPulse,
  Settings2,
  UserRound,
  Users,
  FileText,
  ShieldQuestion,
  Wrench
} from "lucide-react";

export const primaryNavItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    description: "Base platform status"
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    description: "Client and manager records"
  },
  {
    label: "Auth",
    href: "/auth",
    icon: KeyRound,
    description: "Account access components"
  },
  {
    label: "Client",
    href: "/client",
    icon: UserRound,
    description: "Client workspace components"
  },
  {
    label: "Operations",
    href: "/operations",
    icon: ClipboardList,
    description: "Future estimates and scheduling"
  },
  {
    label: "Quality",
    href: "/operations-quality",
    icon: ListChecks,
    description: "Operations and quality controls"
  },
  {
    label: "Data",
    href: "/data-workflow",
    icon: DatabaseZap,
    description: "Data and workflow controls"
  },
  {
    label: "Comms",
    href: "/communication",
    icon: MessagesSquare,
    description: "Messages and notifications"
  },
  {
    label: "Manager",
    href: "/manager",
    icon: LayoutDashboard,
    description: "Future manager workspace"
  },
  {
    label: "Admin",
    href: "/admin",
    icon: ShieldCheck,
    description: "Admin and security controls"
  },
  {
    label: "Security",
    href: "/security",
    icon: ShieldCheck,
    description: "Platform hardening status"
  },
  {
    label: "Platform",
    href: "/platform",
    icon: Settings2,
    description: "Reusable production controls"
  },
  {
    label: "Health",
    href: "/health",
    icon: HeartPulse,
    description: "Runtime readiness"
  },
  {
    label: "Privacy",
    href: "/privacy",
    icon: ShieldQuestion,
    description: "Consent and privacy boilerplate"
  },
  {
    label: "Terms",
    href: "/terms",
    icon: FileText,
    description: "Terms boilerplate"
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    description: "Maintenance mode page"
  }
];

export function getNavItemByHref(href) {
  return primaryNavItems.find((item) => item.href === href);
}
