"use client";
import {
  LayoutDashboard, Building2, Wallet, Bot, ShieldCheck, HeartPulse,
  UserCog, LifeBuoy, CalendarCheck, CalendarClock, LayoutGrid, Package
} from "lucide-react";
import { PortalSidebar, type NavItem } from "./AdminSidebar";

export const superAdminNavItems: NavItem[] = [
  { label: "Enterprise Dashboard", href: "/super-admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    label: "Operations", icon: <CalendarCheck className="w-4 h-4" />,
    children: [
      { label: "Bookings", href: "/super-admin/bookings" },
      { label: "Uploaded Bills", href: "/super-admin/bills" },
      { label: "Reviews", href: "/super-admin/reviews" },
    ],
  },
  {
    label: "Catalogue", icon: <Package className="w-4 h-4" />,
    children: [
      { label: "Hospitals", href: "/super-admin/entities/hospitals" },
      { label: "Doctors", href: "/super-admin/entities/doctors" },
      { label: "Laboratories", href: "/super-admin/entities/laboratories" },
      { label: "Diagnostic Centres", href: "/super-admin/entities/diagnostics" },
      { label: "Tests & Prices", href: "/super-admin/catalog/tests" },
    ],
  },
  {
    label: "Schedules", icon: <CalendarClock className="w-4 h-4" />,
    children: [
      { label: "Doctor Slots", href: "/super-admin/schedules/doctor-slots" },
      { label: "Lab & Centre Slots", href: "/super-admin/schedules/centre-slots" },
    ],
  },
  {
    label: "App Content", icon: <LayoutGrid className="w-4 h-4" />,
    children: [
      { label: "Home Quick Actions", href: "/super-admin/content/quick-actions" },
      { label: "Home Vault", href: "/super-admin/content/vault" },
      { label: "Offers", href: "/super-admin/content/offers" },
    ],
  },
  {
    label: "Users & Access", icon: <UserCog className="w-4 h-4" />,
    children: [
      { label: "Users", href: "/super-admin/entities/users" },
      { label: "Admins", href: "/super-admin/entities/admins" },
      { label: "Audit Log", href: "/super-admin/audit-log" },
    ],
  },
  {
    label: "Membership", icon: <ShieldCheck className="w-4 h-4" />,
    children: [
      { label: "Plans", href: "/super-admin/membership/plans" },
      { label: "Hospital Discounts", href: "/super-admin/membership/hospital-discounts" },
      { label: "Analytics", href: "/super-admin/membership/analytics" },
      { label: "User Memberships", href: "/super-admin/membership/users" },
      { label: "Rules & Config", href: "/super-admin/membership/rules" },
      { label: "Audit Log", href: "/super-admin/membership/audit" },
      { label: "Reports", href: "/super-admin/membership/reports" },
    ],
  },
  {
    label: "Entity Management", icon: <Building2 className="w-4 h-4" />,
    children: [
      { label: "Dashboard", href: "/super-admin/entities/dashboard" },
      { label: "Medical Stores", href: "/super-admin/entities/medical-stores" },
    ],
  },
  {
    label: "Wallet & Credits", icon: <Wallet className="w-4 h-4" />,
    children: [
      { label: "Configuration", href: "/super-admin/wallet/configuration" },
      { label: "Analytics", href: "/super-admin/wallet/analytics" },
      { label: "User Wallets", href: "/super-admin/wallet/users" },
      { label: "Utilization Policy", href: "/super-admin/wallet/utilization" },
      { label: "Audit Log", href: "/super-admin/wallet/audit" },
      { label: "Reports", href: "/super-admin/wallet/reports" },
    ],
  },
  { label: "Support Tickets", href: "/super-admin/support/tickets", icon: <LifeBuoy className="w-4 h-4" /> },
  { label: "AI Analytics", href: "/super-admin/ai-analytics", icon: <Bot className="w-4 h-4" />, badge: "AI" },
];

export function SuperAdminSidebar() {
  return <PortalSidebar items={superAdminNavItems} subtitle="Super Admin" subtitleAccent />;
}
