import { SuperAdminSidebar } from "@/components/layout/SuperAdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super Admin" };

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
