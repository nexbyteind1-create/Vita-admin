"use client";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "success" | "warning";
type ButtonSize = "xs" | "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10",
  secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200",
  danger:    "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
  ghost:     "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
  outline:   "border border-red-300 hover:border-red-400 text-red-600 hover:bg-red-50",
  success:   "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200",
  warning:   "bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200",
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
