import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { RequireAdmin } from "@/lib/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin roles={["admin", "super_admin"]}>
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-vita-bg">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
    </RequireAdmin>
  );
}
