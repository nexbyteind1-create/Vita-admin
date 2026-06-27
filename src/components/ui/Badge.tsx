"use client";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "active" | "suspended" | "blocked" | "pending" | "archived" | "inactive" | "approved" | "rejected" | "verified" | "silver" | "gold" | "platinum";

const variantMap: Record<BadgeVariant, string> = {
  active:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  approved:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  verified:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  suspended: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  blocked:   "bg-red-500/15 text-red-400 border-red-500/30",
  pending:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
  archived:  "bg-slate-500/15 text-slate-400 border-slate-500/30",
  inactive:  "bg-slate-500/15 text-slate-400 border-slate-500/30",
  rejected:  "bg-red-500/15 text-red-400 border-red-500/30",
  silver:    "bg-slate-400/15 text-slate-300 border-slate-400/30",
  gold:      "bg-amber-500/15 text-amber-400 border-amber-500/30",
  platinum:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const dotMap: Record<BadgeVariant, string> = {
  active:    "bg-emerald-400",
  approved:  "bg-emerald-400",
  verified:  "bg-emerald-400",
  suspended: "bg-amber-400",
  blocked:   "bg-red-400",
  pending:   "bg-blue-400",
  archived:  "bg-slate-400",
  inactive:  "bg-slate-400",
  rejected:  "bg-red-400",
  silver:    "bg-slate-300",
  gold:      "bg-amber-400",
  platinum:  "bg-purple-400",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ variant, label, dot = true, size = "md", className }: BadgeProps) {
  const displayLabel = label ?? variant.charAt(0).toUpperCase() + variant.slice(1);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium border rounded-full",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      variantMap[variant],
      className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotMap[variant])} />}
      {displayLabel}
    </span>
  );
}
