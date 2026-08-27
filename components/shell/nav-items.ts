import {
  BarChart3,
  Download,
  LayoutDashboard,
  Receipt,
  Sparkles,
  Target,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown as the header subtitle for this route. */
  subtitle: string;
  /** Hidden from the sidebar unless the viewer is an admin. */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    subtitle: "Here's how your finances are looking this month.",
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: Wallet,
    subtitle: "Plan how much to spend in each category, month by month.",
  },
  {
    href: "/expenses",
    label: "Expenses",
    icon: Receipt,
    subtitle: "Log what you spend and keep it categorized.",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    subtitle: "How your money moved, at a glance.",
  },
  {
    href: "/goals",
    label: "Goals",
    icon: Target,
    subtitle: "Track what you're saving toward, and when you'll get there.",
  },
  {
    href: "/insights",
    label: "AI Insights",
    icon: Sparkles,
    subtitle: "Patterns and recommendations from your spending.",
  },
  {
    href: "/export",
    label: "Export",
    icon: Download,
    subtitle: "Download your expenses, budgets, and reports.",
  },
  {
    href: "/users",
    label: "Users",
    icon: Users,
    subtitle: "Everyone who has signed up, and who can administer the app.",
    adminOnly: true,
  },
];

/** The items a viewer may see. Sidebar visibility only — access is enforced
 *  by row-level security in the database. */
export function visibleNavItems(isAdmin: boolean): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
