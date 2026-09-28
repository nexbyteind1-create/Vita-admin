"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ROLE_LABEL, useSession } from "@/lib/auth/session";

/** The signed-in admin at the foot of the sidebar, with sign out. */
export function SidebarUser() {
  const { admin, signOut } = useSession();
  const router = useRouter();
  const name = admin?.full_name || admin?.email || "Admin";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join("");

  return (
    <div className="p-4 border-t border-slate-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-700 truncate">{name}</div>
          <div className="text-xs text-slate-400 truncate">
            {admin ? ROLE_LABEL[admin.role] : "Admin"} · {admin?.email}
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
