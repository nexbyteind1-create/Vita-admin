"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Loader2, ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export type AdminRole = "super_admin" | "admin" | "hospital" | "doctor" | "lab" | "diagnostic";

export interface AdminProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
  /** The partner's own record: set for hospital, doctor and lab / diagnostic accounts. */
  hospital_id: string | null;
  doctor_id: string | null;
  centre_id: string | null;
}

export const ADMIN_COLUMNS = "user_id, email, full_name, role, is_active, hospital_id, doctor_id, centre_id";

export const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hospital: "Hospital",
  doctor: "Doctor",
  lab: "Laboratory",
  diagnostic: "Diagnostic Centre",
};

/** Console sections, by URL prefix. Labs and diagnostic centres share /centre. */
export type Portal = "super-admin" | "admin" | "hospital" | "doctor" | "centre";

const PORTAL_OF: Record<AdminRole, Portal> = {
  super_admin: "super-admin",
  admin: "admin",
  hospital: "hospital",
  doctor: "doctor",
  lab: "centre",
  diagnostic: "centre",
};

/** Where each role signs in to. */
export const homeFor = (role: AdminRole) => `/${PORTAL_OF[role]}/dashboard`;

type Status = "loading" | "signed-out" | "no-access" | "pending" | "ready";

interface SessionValue {
  status: Status;
  user: User | null;
  admin: AdminProfile | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

async function loadAdmin(user: User | null): Promise<{ status: Status; admin: AdminProfile | null }> {
  if (!user) return { status: "signed-out", admin: null };
  const { data, error } = await supabase()
    .from("admin_users")
    .select(ADMIN_COLUMNS)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return { status: "no-access", admin: null };
  return { status: data.is_active ? "ready" : "pending", admin: data as AdminProfile };
}

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ status: Status; user: User | null; admin: AdminProfile | null }>({
    status: "loading",
    user: null,
    admin: null,
  });

  const refresh = useCallback(async () => {
    const { data } = await supabase().auth.getUser();
    const user = data.user ?? null;
    setState({ user, ...(await loadAdmin(user)) });
  }, []);

  useEffect(() => {
    let cancelled = false;
    supabase()
      .auth.getUser()
      .then(async ({ data }) => {
        const user = data.user ?? null;
        const result = await loadAdmin(user);
        if (!cancelled) setState({ user, ...result });
      });
    const { data } = supabase().auth.onAuthStateChange(event => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await supabase().auth.signOut();
    setState({ status: "signed-out", user: null, admin: null });
  }, []);

  return (
    <SessionContext.Provider value={{ ...state, refresh, signOut }}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside AdminSessionProvider");
  return value;
}

/**
 * The section being viewed and, for partners, the record they run. Catalogue
 * tables are readable by everyone signed in, so partner pages narrow their
 * lists with these ids; RLS decides what they can change.
 */
export function usePortal() {
  const { admin } = useSession();
  const segment = usePathname().split("/")[1] as Portal;
  const portal: Portal = Object.values(PORTAL_OF).includes(segment) ? segment : "admin";
  return {
    portal,
    base: `/${portal}`,
    isPartner: portal === "hospital" || portal === "doctor" || portal === "centre",
    hospitalId: admin?.hospital_id ?? null,
    doctorId: admin?.doctor_id ?? null,
    centreId: admin?.centre_id ?? null,
  };
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex items-center justify-center p-6 bg-vita-bg">{children}</div>;
}

/**
 * Gate for a console section. RLS is the real guard; this only keeps people
 * who can't use the section from seeing an empty shell.
 */
export function RequireAdmin({ roles, children }: { roles: AdminRole[]; children: React.ReactNode }) {
  const { status, admin, signOut } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "signed-out") router.replace("/login");
  }, [status, router]);

  if (status === "loading" || status === "signed-out") {
    return (
      <Screen>
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </Screen>
    );
  }

  if (status !== "ready" || !admin || !roles.includes(admin.role)) {
    const pending = status === "pending";
    return (
      <Screen>
        <div className="glass-card p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="text-lg font-bold text-slate-900">
            {pending ? "Waiting for approval" : status === "ready" ? "Not part of your console" : "No console access"}
          </h1>
          <p className="text-sm text-slate-500">
            {pending
              ? "Your access request has been sent. A super admin needs to approve it under Entity Management → Admins."
              : status === "ready"
                ? `This section isn't available to ${admin ? ROLE_LABEL[admin.role] : ""} accounts.`
                : "This account isn't a VitaAdmin user. Request access from the sign-in page."}
          </p>
          <div className="flex gap-2 justify-center">
            {status === "ready" && admin && (
              <Link href={homeFor(admin.role)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">
                Go to my dashboard
              </Link>
            )}
            <button
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  return <>{children}</>;
}
