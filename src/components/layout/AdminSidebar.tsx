"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Users, Building2, Stethoscope, FlaskConical, Scan,
  Store, CreditCard, BarChart3, FileText, ChevronDown, Activity,
  HeartPulse, ShieldCheck, X
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    label: "Membership", icon: <ShieldCheck className="w-4 h-4" />,
    children: [
      { label: "Overview", href: "/admin/membership/dashboard" },
      { label: "Analytics", href: "/admin/membership/analytics" },
      { label: "Feature Usage", href: "/admin/membership/feature-usage" },
      { label: "Reports", href: "/admin/membership/reports" },
    ],
  },
  { label: "Hospitals", href: "/admin/hospitals", icon: <Building2 className="w-4 h-4" /> },
  { label: "Doctors", href: "/admin/doctors", icon: <Stethoscope className="w-4 h-4" /> },
  { label: "Laboratories", href: "/admin/laboratories", icon: <FlaskConical className="w-4 h-4" /> },
  { label: "Diagnostics", href: "/admin/diagnostics", icon: <Scan className="w-4 h-4" /> },
  { label: "Medical Stores", href: "/admin/medical-stores", icon: <Store className="w-4 h-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
  { label: "Reports", href: "/admin/reports", icon: <FileText className="w-4 h-4" /> },
];

function NavGroup({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isChildActive = item.children?.some(c => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive ?? false);

  if (item.children) {
    return (
      <div>
        <button onClick={() => setOpen(o => !o)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group", isChildActive ? "text-red-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}>
          <span className={cn("flex-shrink-0", isChildActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600")}>{item.icon}</span>
          {!collapsed && <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-400", open && "rotate-180")} />
          </>}
        </button>
        {open && !collapsed && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {item.children.map(child => (
              <Link key={child.href} href={child.href} onClick={onNavigate} className={cn("block px-3 py-2 text-xs rounded-lg transition-all duration-150 font-medium", pathname === child.href || pathname.startsWith(child.href) ? "text-red-600 bg-red-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}>
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href) : false;
  return (
    <Link href={item.href!} onClick={onNavigate} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group", isActive ? "sidebar-active" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}>
      <span className={cn("flex-shrink-0", isActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600")}>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function AdminSidebar() {
  const { isOpen, close: onClose } = useSidebar();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        "flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 flex-shrink-0 fixed inset-y-0 left-0 z-40 lg:static lg:translate-x-0",
        collapsed ? "lg:w-16" : "lg:w-64",
        "w-64",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-4.5 h-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-900 tracking-tight">VitaAdmin</div>
              <div className="text-xs text-slate-400">Admin Portal</div>
            </div>
          )}
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map(item => (
            <NavGroup key={item.label} item={item} collapsed={collapsed} onNavigate={onClose} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex items-center justify-center py-3 border-t border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs gap-2">
          {collapsed ? "→" : "← Collapse"}
        </button>
      </aside>
    </>
  );
}
