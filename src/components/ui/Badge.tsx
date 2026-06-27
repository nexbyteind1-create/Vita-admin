"use client";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "active" | "suspended" | "blocked" | "pending" | "archived" | "inactive" | "approved" | "rejected" | "verified" | "silver" | "gold" | "platinum";

const variantMap: Record<BadgeVariant, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  approved:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-amber-50 text-amber-700 border-amber-200",
  blocked:   "bg-red-50 text-red-700 border-red-200",
  pending:   "bg-blue-50 text-blue-700 border-blue-200",
  archived:  "bg-slate-100 text-slate-600 border-slate-200",
  inactive:  "bg-slate-100 text-slate-600 border-slate-200",
  rejected:  "bg-red-50 text-red-700 border-red-200",
  silver:    "bg-slate-100 text-slate-600 border-slate-200",
  gold:      "bg-amber-50 text-amber-700 border-amber-200",
  platinum:  "bg-purple-50 text-purple-700 border-purple-200",
};

const dotMap: Record<BadgeVariant, string> = {
  active:    "bg-emerald-500",
  approved:  "bg-emerald-500",
  verified:  "bg-emerald-500",
  suspended: "bg-amber-500",
  blocked:   "bg-red-500",
  pending:   "bg-blue-500",
  archived:  "bg-slate-400",
  inactive:  "bg-slate-400",
  rejected:  "bg-red-500",
  silver:    "bg-slate-400",
  gold:      "bg-amber-500",
  platinum:  "bg-purple-500",
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
