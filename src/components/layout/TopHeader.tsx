"use client";
import { Bell, Search, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  role?: "admin" | "super-admin";
  actions?: React.ReactNode;
}

export function TopHeader({ title, subtitle, role = "admin", actions }: TopHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f2d45] bg-[#0d1526]/80 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input type="text" placeholder="Quick search..." className="vita-input py-2 pl-9 pr-4 text-xs w-52" />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse-glow" />
          </button>
          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 glass-card z-20 border border-[#1f2d45] animate-fade-in-up py-2">
                <div className="px-4 py-2 border-b border-[#1f2d45]">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>
                {[
                  { msg: "6,240 memberships expiring this month", time: "Just now", type: "warning" },
                  { msg: "New hospital registration pending approval", time: "5m ago", type: "info" },
                  { msg: "Monthly credit limit config updated", time: "1h ago", type: "success" },
                  { msg: "System audit log exported", time: "2h ago", type: "info" },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-start gap-3">
                    <div className={cn("w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0", n.type === "warning" ? "bg-amber-400" : n.type === "success" ? "bg-emerald-400" : "bg-blue-400")} />
                    <div>
                      <p className="text-xs text-slate-200">{n.msg}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Role badge + avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1f2d45]">
          <span className={cn("text-xs font-semibold px-2 py-1 rounded-full", role === "super-admin" ? "bg-gradient-to-r from-blue-500/20 to-emerald-500/20 text-blue-300 border border-blue-500/20" : "bg-blue-500/15 text-blue-400 border border-blue-500/20")}>
            {role === "super-admin" ? "Super Admin" : "Admin"}
          </span>
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white", role === "super-admin" ? "bg-gradient-to-br from-blue-600 to-purple-600" : "bg-gradient-to-br from-blue-700 to-blue-900")}>
            {role === "super-admin" ? "SA" : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
