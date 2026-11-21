import {
  BarChart3,
  Bot,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  ListOrdered,
  Settings2,
  UsersRound,
} from "lucide-react";

export const dashboardNavigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/agents", label: "AI agents", icon: Bot },
  { href: "/approvals", label: "Approvals", icon: ClipboardCheck },
  { href: "/wallet", label: "Wallet", icon: CircleDollarSign },
  { href: "/transactions", label: "Transactions", icon: ListOrdered },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/scheduled-payments", label: "Schedules", icon: CalendarClock },
  { href: "/agent-requests", label: "Agent requests", icon: UsersRound },
  { href: "/marketplace", label: "Marketplace", icon: Compass },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
