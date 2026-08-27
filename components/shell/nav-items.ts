import {
  BarChart3,
  Download,
  LayoutDashboard,
  Receipt,
  Settings,
  Sparkles,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown as the header subtitle for this route. */
  subtitle: string;
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
    href: "/settings",
    label: "Settings",
    icon: Settings,
    subtitle: "Manage your profile, currency, and categories.",
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
