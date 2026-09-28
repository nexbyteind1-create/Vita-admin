import { PartnerShell } from "@/components/layout/PartnerSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hospital" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PartnerShell portal="hospital">{children}</PartnerShell>;
}
