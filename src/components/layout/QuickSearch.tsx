"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { Portal } from "@/lib/auth/session";
import { adminNavItems } from "@/components/layout/AdminSidebar";
import { superAdminNavItems } from "@/components/layout/SuperAdminSidebar";
import { partnerNavByPortal } from "@/components/layout/PartnerSidebar";
import { filterQuickSearchRoutes, flattenNavItems } from "@/lib/navigation/flatten-nav";

interface QuickSearchProps {
  role?: Portal;
  className?: string;
}

function portalFromPath(pathname: string): Portal {
  const segment = pathname.split("/")[1];
  if (
    segment === "super-admin" ||
    segment === "admin" ||
    segment === "hospital" ||
    segment === "doctor" ||
    segment === "centre"
  ) {
    return segment;
  }
  return "admin";
}

export function QuickSearch({ role, className }: QuickSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const portal = role ?? portalFromPath(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const routes = useMemo(() => {
    if (portal === "super-admin") return flattenNavItems(superAdminNavItems);
    if (portal === "admin") return flattenNavItems(adminNavItems);
    if (portal === "hospital" || portal === "doctor" || portal === "centre") {
      return flattenNavItems(partnerNavByPortal[portal]);
    }
    return flattenNavItems(adminNavItems);
  }, [portal]);

  const results = useMemo(() => filterQuickSearchRoutes(routes, query), [routes, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goTo = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + results.length) % results.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) goTo(target.href);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative hidden md:block", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Quick search…"
        aria-label="Quick search pages"
        aria-expanded={open}
        aria-controls="quick-search-results"
        autoComplete="off"
        className="vita-input w-56 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400"
      />

      {open && (
        <div
          id="quick-search-results"
          role="listbox"
          className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] glass-card z-30 border border-slate-200 animate-fade-in-up py-1 max-h-80 overflow-y-auto shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-xs text-slate-400 text-center">No pages match your search</p>
          ) : (
            results.map((item, index) => (
              <button
                key={item.href}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(item.href)}
                className={cn(
                  "w-full text-left px-4 py-2.5 transition-colors",
                  index === activeIndex ? "bg-red-50" : "hover:bg-slate-50"
                )}
              >
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="text-xs text-slate-400">{item.group}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
