import type { NavItem } from "@/components/layout/AdminSidebar";

export interface QuickSearchRoute {
  label: string;
  href: string;
  group: string;
}

export function flattenNavItems(items: NavItem[]): QuickSearchRoute[] {
  const routes: QuickSearchRoute[] = [];
  for (const item of items) {
    if (item.href) {
      routes.push({ label: item.label, href: item.href, group: "Pages" });
    }
    if (item.children) {
      for (const child of item.children) {
        routes.push({ label: child.label, href: child.href, group: item.label });
      }
    }
  }
  return routes;
}

export function filterQuickSearchRoutes(routes: QuickSearchRoute[], query: string): QuickSearchRoute[] {
  const term = query.trim().toLowerCase();
  if (!term) return routes.slice(0, 8);
  return routes
    .filter(
      r =>
        r.label.toLowerCase().includes(term) ||
        r.group.toLowerCase().includes(term) ||
        r.href.toLowerCase().includes(term)
    )
    .slice(0, 12);
}
