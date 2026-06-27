"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Eye, EyeOff, ArrowRight, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "super-admin">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    router.push(role === "super-admin" ? "/super-admin/dashboard" : "/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #1f2d45 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md mx-4 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-xl shadow-blue-900/40 mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">VitaAdmin</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Healthcare Platform Management Console</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 glow-blue">
          {/* Role Selector */}
          <div className="flex rounded-xl bg-[#080d1a] p-1 mb-6 border border-[#1f2d45]">
            <button
              onClick={() => setRole("admin")}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200", role === "admin" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
            <button
              onClick={() => setRole("super-admin")}
              className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200", role === "super-admin" ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300")}
            >
              <Sparkles className="w-4 h-4" />
              Super Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={role === "super-admin" ? "superadmin@vita.health" : "admin@vita.health"}
                className="vita-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="vita-input pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg",
                role === "super-admin"
                  ? "bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-900/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In as {role === "super-admin" ? "Super Admin" : "Admin"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Vita Healthcare Platform &copy; {new Date().getFullYear()} · Secure Admin Console
          </p>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-slate-600 mt-4">
          Demo: Enter any email and password to continue
        </p>
      </div>
    </div>
  );
}
