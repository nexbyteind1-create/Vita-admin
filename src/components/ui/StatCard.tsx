"use client";
import { cn } from "@/lib/utils/cn";
import { formatCompact, formatDelta } from "@/lib/utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatCardColor = "blue" | "emerald" | "amber" | "purple" | "red" | "cyan" | "silver";

const colorMap: Record<StatCardColor, { gradient: string; icon: string; glow: string; badge: string }> = {
  blue:    { gradient: "from-blue-600/20 to-blue-800/5",    icon: "text-blue-400",    glow: "glow-blue",    badge: "bg-blue-500/20 text-blue-400" },
  emerald: { gradient: "from-emerald-600/20 to-emerald-800/5", icon: "text-emerald-400", glow: "glow-emerald", badge: "bg-emerald-500/20 text-emerald-400" },
  amber:   { gradient: "from-amber-600/20 to-amber-800/5",   icon: "text-amber-400",   glow: "glow-amber",   badge: "bg-amber-500/20 text-amber-400" },
  purple:  { gradient: "from-purple-600/20 to-purple-800/5", icon: "text-purple-400",  glow: "glow-purple",  badge: "bg-purple-500/20 text-purple-400" },
  red:     { gradient: "from-red-600/20 to-red-800/5",       icon: "text-red-400",     glow: "glow-red",     badge: "bg-red-500/20 text-red-400" },
  cyan:    { gradient: "from-cyan-600/20 to-cyan-800/5",     icon: "text-cyan-400",    glow: "glow-cyan",    badge: "bg-cyan-500/20 text-cyan-400" },
  silver:  { gradient: "from-slate-600/20 to-slate-800/5",   icon: "text-slate-400",   glow: "",             badge: "bg-slate-500/20 text-slate-400" },
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
        onClick && "hover:border-blue-500/40",
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
            <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", deltaInfo.positive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400")}>
              {deltaInfo.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {deltaInfo.text}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1 tracking-tight">
          {typeof value === "number" ? formatCompact(value) : value}
        </div>
        <div className="text-sm text-slate-400 font-medium">{label}</div>
        {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
        {deltaLabel && <div className="text-xs text-slate-500 mt-0.5">{deltaLabel}</div>}
      </div>
    </div>
  );
}
