"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Users, Building2, Stethoscope, FlaskConical, Scan,
  Store, Wallet, Bot, ChevronDown, ShieldCheck, HeartPulse, Settings,
  UserCog, FileBarChart
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Enterprise Dashboard", href: "/super-admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    label: "Membership", icon: <ShieldCheck className="w-4 h-4" />,
    children: [
      { label: "Plans", href: "/super-admin/membership/plans" },
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
      { label: "Users", href: "/super-admin/entities/users" },
      { label: "Hospitals", href: "/super-admin/entities/hospitals" },
      { label: "Doctors", href: "/super-admin/entities/doctors" },
      { label: "Medical Stores", href: "/super-admin/entities/medical-stores" },
      { label: "Laboratories", href: "/super-admin/entities/laboratories" },
      { label: "Diagnostics", href: "/super-admin/entities/diagnostics" },
      { label: "Admins", href: "/super-admin/entities/admins" },
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
  { label: "AI Analytics", href: "/super-admin/ai-analytics", icon: <Bot className="w-4 h-4" />, badge: "AI" },
];

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isChildActive = item.children?.some(c => pathname.startsWith(c.href));
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href) : false;
  const [open, setOpen] = useState(isChildActive ?? false);

  if (item.children) {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group", isChildActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>
          <span className={cn("flex-shrink-0", isChildActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")}>{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-500", open && "rotate-180")} />
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-[#1f2d45] pl-3">
            {item.children.map(child => (
              <Link key={child.href} href={child.href} className={cn("block px-3 py-2 text-xs rounded-lg transition-all font-medium", pathname === child.href || pathname.startsWith(child.href) ? "text-blue-400 bg-blue-500/10" : "text-slate-500 hover:text-slate-200 hover:bg-white/5")}>
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href!} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group", isActive ? "sidebar-active" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>
      <span className={cn("flex-shrink-0", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")}>{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-full">{item.badge}</span>}
    </Link>
  );
}

export function SuperAdminSidebar() {
  return (
    <aside className="flex flex-col h-screen w-64 bg-[#0d1526] border-r border-[#1f2d45] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1f2d45]">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <HeartPulse className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">VitaAdmin</div>
          <div className="text-xs bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-semibold">Super Admin</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => (
          <NavGroup key={item.label} item={item} />
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#1f2d45]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">SA</div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Super Admin</div>
            <div className="text-xs text-slate-500 truncate">admin@vita.health</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
