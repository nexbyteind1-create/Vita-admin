"use client";
import { cn } from "@/lib/utils/cn";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function ToggleSwitch({ enabled, onChange, label, description, disabled, size = "md" }: ToggleSwitchProps) {
  return (
    <div className={cn("flex items-center gap-3", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={cn(
          "vita-toggle flex-shrink-0 transition-all",
          size === "sm" ? "w-9 h-5" : "w-11 h-6",
          enabled ? "on" : "off",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      />
      {(label || description) && (
        <div>
          {label && <div className="text-sm font-medium text-slate-200">{label}</div>}
          {description && <div className="text-xs text-slate-500">{description}</div>}
        </div>
      )}
    </div>
  );
}
