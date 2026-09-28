"use client";
import { Bell, Search, Settings, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSidebar } from "./SidebarContext";
import { ROLE_LABEL, useSession, type Portal } from "@/lib/auth/session";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  role?: Portal;
  actions?: React.ReactNode;
}

export function TopHeader({ title, subtitle, role = "admin", actions }: TopHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const { toggle } = useSidebar();
  const { admin } = useSession();
  const initials = (admin?.full_name || admin?.email || (role === "super-admin" ? "SA" : "A"))
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join("");

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggle} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex-shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Quick search..." className="vita-input py-2 pl-9 pr-4 text-xs w-52" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <Bell className="w-4.5 h-4.5" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] glass-card z-20 border border-slate-200 animate-fade-in-up py-2">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                </div>
                <p className="px-4 py-6 text-xs text-slate-400 text-center">No new notifications</p>
              </div>
            </>
          )}
        </div>

        {/* Role badge + avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", role === "super-admin" ? "bg-red-50 text-red-700 border border-red-200" : "bg-red-50 text-red-700 border border-red-200")}>
            {admin ? ROLE_LABEL[admin.role] : role === "super-admin" ? "Super Admin" : "Admin"}
          </span>
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white", role === "super-admin" ? "bg-gradient-to-br from-red-600 to-rose-600" : "bg-gradient-to-br from-red-700 to-red-900")}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
