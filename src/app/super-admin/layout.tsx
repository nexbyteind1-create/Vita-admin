import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super Admin" };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-vita-bg">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
