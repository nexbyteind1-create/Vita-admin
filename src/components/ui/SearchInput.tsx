"use client";
import { Search, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  size?: "sm" | "md";
}

export function SearchInput({ placeholder = "Search...", onSearch, debounceMs = 300, className, size = "md" }: SearchInputProps) {
  const [value, setValue] = useState("");

  const debounced = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (v: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => onSearch(v), debounceMs);
      };
    })(),
    [onSearch, debounceMs]
  );

  useEffect(() => { debounced(value); }, [value, debounced]);

  return (
    <div className={cn("relative", className)}>
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "vita-input pr-8",
          size === "sm" ? "py-2 pl-8 text-xs" : "pl-10"
        )}
      />
      {value && (
        <button onClick={() => setValue("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
