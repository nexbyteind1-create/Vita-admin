"use client";
import { CalendarCheck, CalendarClock, IndianRupee, LayoutDashboard, Star, Stethoscope, Store } from "lucide-react";
import { RequireAdmin, ROLE_LABEL, useSession, type AdminRole, type Portal } from "@/lib/auth/session";
import { PortalSidebar, type NavItem } from "./AdminSidebar";
import { SidebarProvider } from "./SidebarContext";

export type PartnerPortal = Extract<Portal, "hospital" | "doctor" | "centre">;

const icon = (Icon: typeof LayoutDashboard) => <Icon className="w-4 h-4" />;

/** Only the modules a hospital, doctor or lab / diagnostic centre runs itself. */
const NAV: Record<PartnerPortal, NavItem[]> = {
  hospital: [
    { label: "Dashboard", href: "/hospital/dashboard", icon: icon(LayoutDashboard) },
    { label: "Bookings", href: "/hospital/bookings", icon: icon(CalendarCheck) },
    { label: "Doctors", href: "/hospital/doctors", icon: icon(Stethoscope) },
    { label: "Doctor Slots", href: "/hospital/schedules/doctor-slots", icon: icon(CalendarClock) },
    { label: "Reviews", href: "/hospital/reviews", icon: icon(Star) },
    { label: "Hospital Profile", href: "/hospital/profile", icon: icon(Store) },
  ],
  doctor: [
    { label: "Dashboard", href: "/doctor/dashboard", icon: icon(LayoutDashboard) },
    { label: "Appointments", href: "/doctor/bookings", icon: icon(CalendarCheck) },
    { label: "My Slots", href: "/doctor/schedules/doctor-slots", icon: icon(CalendarClock) },
    { label: "Reviews", href: "/doctor/reviews", icon: icon(Star) },
    { label: "My Profile", href: "/doctor/profile", icon: icon(Stethoscope) },
  ],
  centre: [
    { label: "Dashboard", href: "/centre/dashboard", icon: icon(LayoutDashboard) },
    { label: "Bookings", href: "/centre/bookings", icon: icon(CalendarCheck) },
    { label: "Tests & Prices", href: "/centre/prices", icon: icon(IndianRupee) },
    { label: "Slots", href: "/centre/schedules/centre-slots", icon: icon(CalendarClock) },
    { label: "Reviews", href: "/centre/reviews", icon: icon(Star) },
    { label: "Centre Profile", href: "/centre/profile", icon: icon(Store) },
  ],
};

export function PartnerSidebar({ portal }: { portal: PartnerPortal }) {
  const { admin } = useSession();
  return <PortalSidebar items={NAV[portal]} subtitle={`${admin ? ROLE_LABEL[admin.role] : "Partner"} Portal`} />;
}

/** Signed-in frame for a partner portal: gate, sidebar and scrolling main. */
export function PartnerShell({ portal, children }: { portal: PartnerPortal; children: React.ReactNode }) {
  const roles: AdminRole[] = portal === "centre" ? ["lab", "diagnostic"] : [portal];
  return (
    <RequireAdmin roles={roles}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-vita-bg">
          <PartnerSidebar portal={portal} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </RequireAdmin>
  );
}
