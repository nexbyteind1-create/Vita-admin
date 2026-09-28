"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Eye, EyeOff, ArrowRight, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { supabase } from "@/lib/supabase/client";
import { ADMIN_COLUMNS, homeFor, useSession, type AdminProfile } from "@/lib/auth/session";

/**
 * Supabase Auth email + password. The account's admin_users row decides where
 * it lands (super admin, admin, hospital, doctor, lab / diagnostic centre).
 * An account that isn't in admin_users yet is filed as an access request (the
 * very first one becomes the super admin); everyone else waits for a super
 * admin to approve them, and stays signed out until then.
 */
export default function LoginPage() {
  const router = useRouter();
  const { status, admin, refresh, signOut } = useSession();
  const [mode, setMode] = useState<"signin" | "request">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  // Already signed in with approved access: go straight to that role's dashboard.
  useEffect(() => {
    if (status === "ready" && admin) router.replace(homeFor(admin.role));
  }, [status, admin, router]);

  const enter = async (row: AdminProfile) => {
    if (!row.is_active) {
      await signOut();
      setInfo("Your access request is waiting for a super admin to approve it. You'll be able to sign in once it's approved.");
      return;
    }
    router.replace(homeFor(row.role));
  };

  /** This account's admin row, filing an access request if there isn't one yet. */
  const adminRow = async (userId: string, fullName: string) => {
    const existing = await supabase()
      .from("admin_users")
      .select(ADMIN_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) return existing.data as AdminProfile;
    const { data, error } = await supabase().rpc("request_admin_access", { p_full_name: fullName });
    if (error) throw new Error(error.message);
    return data as AdminProfile;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) return setError("Please enter email and password.");
    if (mode === "request" && password.length < 8) return setError("Use a password of at least 8 characters.");
    setLoading(true);
    try {
      let userId: string;
      if (mode === "signin") {
        const { data, error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
        userId = data.user.id;
      } else {
        const { data, error } = await supabase().auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw new Error(error.message);
        if (!data.session || !data.user) {
          setInfo("Check your inbox to confirm your email, then come back and sign in — your access request is filed when you do.");
          setMode("signin");
          return;
        }
        userId = data.user.id;
      }
      const row = await adminRow(userId, name.trim());
      await refresh();
      await enter(row);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: "signin" | "request") => {
    setMode(next);
    setError("");
    setInfo("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-100 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md mx-auto animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl shadow-xl shadow-red-900/20 mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">VitaAdmin</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Healthcare Platform Management Console</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 glow-red">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">{mode === "signin" ? "Sign in" : "Request console access"}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === "signin"
                ? "Super admins, admins, hospitals, doctors, labs and diagnostic centres — you'll land on your own dashboard."
                : "A super admin approves new accounts and sets their role. The first account ever created becomes the super admin."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "request" && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="vita-input" autoComplete="name" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@vita.health" className="vita-input" autoComplete="email" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === "request" ? "At least 8 characters" : "••••••••"}
                  className="vita-input pr-10"
                  autoComplete={mode === "request" ? "new-password" : "current-password"}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            {info && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg bg-red-600 hover:bg-red-500 text-white shadow-red-900/20",
                loading && "opacity-70 cursor-not-allowed",
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "signin" ? (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Request access
                  <UserPlus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            {mode === "signin" ? (
              <>
                New to the console?{" "}
                <button type="button" onClick={() => switchMode("request")} className="text-red-600 hover:text-red-700 font-semibold">
                  Request access
                </button>
              </>
            ) : (
              <>
                Already have access?{" "}
                <button type="button" onClick={() => switchMode("signin")} className="text-red-600 hover:text-red-700 font-semibold">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-slate-400 mt-4">
            Vita Healthcare Platform &copy; {new Date().getFullYear()} · Secure Admin Console
          </p>
        </div>
      </div>
    </div>
  );
}
