"use client";
import { cn } from "@/lib/utils/cn";
import { formatCompact, formatDelta } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardColor = "blue" | "emerald" | "amber" | "purple" | "red" | "cyan" | "silver";

const colorMap: Record<StatCardColor, { gradient: string; icon: string; glow: string; badge: string }> = {
  blue:    { gradient: "from-blue-50 to-transparent",    icon: "text-blue-600",    glow: "glow-blue",    badge: "bg-blue-50 text-blue-600" },
  emerald: { gradient: "from-emerald-50 to-transparent", icon: "text-emerald-600", glow: "glow-emerald", badge: "bg-emerald-50 text-emerald-600" },
  amber:   { gradient: "from-amber-50 to-transparent",   icon: "text-amber-600",   glow: "glow-amber",   badge: "bg-amber-50 text-amber-600" },
  purple:  { gradient: "from-purple-50 to-transparent",  icon: "text-purple-600",  glow: "glow-purple",  badge: "bg-purple-50 text-purple-600" },
  red:     { gradient: "from-red-50 to-transparent",     icon: "text-red-600",     glow: "glow-red",     badge: "bg-red-50 text-red-600" },
  cyan:    { gradient: "from-cyan-50 to-transparent",    icon: "text-cyan-600",    glow: "glow-cyan",    badge: "bg-cyan-50 text-cyan-600" },
  silver:  { gradient: "from-slate-50 to-transparent",   icon: "text-slate-500",   glow: "",             badge: "bg-slate-100 text-slate-600" },
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: StatCardColor;
  delta?: number;
  deltaLabel?: string;
  subValue?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({ label, value, icon, color = "blue", delta, deltaLabel, subValue, onClick, className }: StatCardProps) {
  const c = colorMap[color];
  const deltaInfo = delta !== undefined ? formatDelta(delta) : null;

  return (
    <div
      className={cn(
        "glass-card p-5 cursor-pointer group transition-all duration-300 hover:-translate-y-0.5",
        c.glow,
        onClick && "hover:border-red-300",
        className
      )}
      onClick={onClick}
    >
      <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-50", c.gradient)} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2.5 rounded-lg", c.badge)}>
            <div className={cn("w-5 h-5", c.icon)}>{icon}</div>
          </div>
          {deltaInfo && (
            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", deltaInfo.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
              {deltaInfo.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {deltaInfo.text}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
          {typeof value === "number" ? formatCompact(value) : value}
        </div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
        {subValue && <div className="text-xs text-slate-400 mt-1">{subValue}</div>}
        {deltaLabel && <div className="text-xs text-slate-400 mt-0.5">{deltaLabel}</div>}
      </div>
    </div>
  );
}
