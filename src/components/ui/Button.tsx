"use client";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning";
type ButtonSize = "xs" | "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30",
  secondary: "bg-slate-700/60 hover:bg-slate-600/60 text-slate-200 border border-slate-600/50",
  danger:    "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30",
  ghost:     "hover:bg-white/5 text-slate-400 hover:text-slate-200",
  outline:   "border border-blue-500/40 hover:border-blue-400 text-blue-400 hover:bg-blue-500/10",
  success:   "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30",
  warning:   "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, icon, iconRight, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}
