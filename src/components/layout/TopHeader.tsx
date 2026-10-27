"use client";

import { Bell, Menu, LogOut, Mail, User, Shield } from "lucide-react";
import { QuickSearch } from "./QuickSearch";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const { toggle } = useSidebar();
  const { admin, signOut } = useSession();
  const router = useRouter();

  const displayName = admin?.full_name || admin?.email || (role === "super-admin" ? "Super Admin" : "Admin");
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join("");

  const roleLabel = admin ? ROLE_LABEL[admin.role] : role === "super-admin" ? "Super Admin" : "Admin";

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 sm:px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xl">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap justify-end">
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}

        <QuickSearch role={role} />

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(o => !o)}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Notifications"
          >
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

        <div className="relative pl-2 border-l border-slate-200">
          <button
            type="button"
            onClick={() => setProfileOpen(o => !o)}
            className="flex items-center gap-2 rounded-lg py-1 pr-1 hover:bg-slate-50 transition-colors"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <span className="hidden sm:inline text-xs font-semibold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
              {roleLabel}
            </span>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                role === "super-admin" ? "bg-gradient-to-br from-red-600 to-rose-600" : "bg-gradient-to-br from-red-700 to-red-900"
              )}
            >
              {initials}
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] glass-card z-20 border border-slate-200 animate-fade-in-up overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-200 bg-slate-50/80">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0",
                        role === "super-admin" ? "bg-gradient-to-br from-red-600 to-rose-600" : "bg-gradient-to-br from-red-700 to-red-900"
                      )}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-xs text-slate-500 truncate">{admin?.email ?? "Not signed in"}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 space-y-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Full name</p>
                      <p className="text-slate-800">{admin?.full_name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-slate-800 break-all">{admin?.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Role</p>
                      <p className="text-slate-800">{roleLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Account status</p>
                      <p className="text-slate-800">{admin ? (admin.is_active ? "Active" : "Pending approval") : "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-3 border-t border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
