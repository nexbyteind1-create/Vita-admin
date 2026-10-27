"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Users, ChevronDown, HeartPulse, ShieldCheck, LifeBuoy, X,
  CalendarCheck, CalendarClock, LayoutGrid, Package
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "./SidebarContext";
import { SidebarUser } from "./SidebarUser";

export interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  children?: { label: string; href: string }[];
}

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    label: "Operations", icon: <CalendarCheck className="w-4 h-4" />,
    children: [
      { label: "Bookings", href: "/admin/bookings" },
      { label: "Uploaded Bills", href: "/admin/bills" },
      { label: "Reviews", href: "/admin/reviews" },
    ],
  },
  {
    label: "Catalogue", icon: <Package className="w-4 h-4" />,
    children: [
      { label: "Hospitals", href: "/admin/hospitals" },
      { label: "Doctors", href: "/admin/doctors" },
      { label: "Laboratories", href: "/admin/laboratories" },
      { label: "Diagnostic Centres", href: "/admin/diagnostics" },
      { label: "Tests & Prices", href: "/admin/catalog/tests" },
    ],
  },
  {
    label: "Schedules", icon: <CalendarClock className="w-4 h-4" />,
    children: [
      { label: "Doctor Slots", href: "/admin/schedules/doctor-slots" },
      { label: "Lab & Centre Slots", href: "/admin/schedules/centre-slots" },
    ],
  },
  {
    label: "App Content", icon: <LayoutGrid className="w-4 h-4" />,
    children: [
      { label: "Home Quick Actions", href: "/admin/content/quick-actions" },
      { label: "Home Vault", href: "/admin/content/vault" },
      { label: "Offers", href: "/admin/content/offers" },
    ],
  },
  { label: "Users", href: "/admin/users", icon: <Users className="w-4 h-4" /> },
  { label: "Membership", href: "/admin/membership/dashboard", icon: <ShieldCheck className="w-4 h-4" /> },
  { label: "Support Tickets", href: "/admin/support/tickets", icon: <LifeBuoy className="w-4 h-4" /> },
];

export function NavGroup({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isChildActive = item.children?.some(c => pathname.startsWith(c.href));
  const [open, setOpen] = useState(isChildActive ?? false);

  useEffect(() => {
    if (!collapsed && isChildActive) setOpen(true);
  }, [collapsed, isChildActive]);

  const rowPad = collapsed ? "justify-center px-2" : "gap-3 px-3";

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          onClick={() => {
            if (collapsed) return;
            setOpen(o => !o);
          }}
          className={cn(
            "w-full flex items-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
            rowPad,
            isChildActive ? "text-red-600" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          <span className={cn("flex-shrink-0", isChildActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600")}>
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-400", open && "rotate-180")} />
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
            {item.children.map(child => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "block px-3 py-2 text-xs rounded-lg transition-all duration-150 font-medium",
                  pathname === child.href || pathname.startsWith(child.href)
                    ? "text-red-600 bg-red-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
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
    <Link
      href={item.href!}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
        rowPad,
        isActive ? "sidebar-active" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      <span className={cn("flex-shrink-0", isActive ? "text-red-600" : "text-slate-400 group-hover:text-slate-600")}>
        {item.icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export function AdminSidebar() {
  return <PortalSidebar items={adminNavItems} subtitle="Admin Portal" />;
}

/** Sidebar shell shared by the admin and partner consoles. */
export function PortalSidebar({
  items,
  subtitle,
  subtitleAccent = false,
}: {
  items: NavItem[];
  subtitle: string;
  /** Super Admin portal uses a gradient subtitle. */
  subtitleAccent?: boolean;
}) {
  const { isOpen, close: onClose } = useSidebar();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPointerEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHoverExpanded(true);
  };

  const onPointerLeave = () => {
    leaveTimer.current = setTimeout(() => setHoverExpanded(false), 180);
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isOpen) setHoverExpanded(true);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  /** Full width on mobile drawer; icon rail on desktop until hover. */
  const navCollapsed = isLg && !hoverExpanded;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        onMouseEnter={onPointerEnter}
        onMouseLeave={onPointerLeave}
        className={cn(
          "flex flex-col h-screen bg-white border-r border-slate-200 flex-shrink-0 overflow-hidden",
          "transition-[width,transform] duration-200 ease-out",
          /* Mobile: off-canvas drawer. Desktop: in-flow column so main content is never covered. */
          "fixed inset-y-0 left-0 z-40 w-64 lg:static lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          navCollapsed ? "lg:w-[4.25rem]" : "lg:w-64"
        )}
      >
        <div
          className={cn(
            "flex items-center border-b border-slate-200 py-5",
            navCollapsed ? "lg:justify-center lg:px-2 px-4 gap-3" : "gap-3 px-4"
          )}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-4.5 h-4.5 text-white" />
          </div>
          <div className={cn("flex-1 min-w-0", navCollapsed && "lg:hidden")}>
            <div className="text-sm font-bold text-slate-900 tracking-tight">VitaAdmin</div>
            <div
              className={cn(
                "text-xs truncate",
                subtitleAccent
                  ? "bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent font-semibold"
                  : "text-slate-400"
              )}
            >
              {subtitle}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className={cn("flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-0.5", navCollapsed ? "lg:px-1.5 px-3" : "px-3")}>
          {items.map(item => (
            <NavGroup
              key={item.label}
              item={item}
              collapsed={navCollapsed}
              onNavigate={onClose}
            />
          ))}
        </nav>

        <p
          className={cn(
            "hidden lg:block text-[10px] text-center text-slate-400 px-2 pb-2 transition-opacity",
            navCollapsed ? "opacity-100" : "opacity-0 h-0 pb-0 overflow-hidden"
          )}
        >
          Hover to expand
        </p>

        <SidebarUser collapsed={navCollapsed} />
      </aside>
    </>
  );
}
