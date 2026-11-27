"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign in right now.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1b2b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-[#08111c] px-6 py-5 border-b-4 border-[#d9272e] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#ff767b]">
              Contour Steel Engineering
            </p>
            <h1 className="text-lg font-bold text-white mt-0.5">
              Website Control Panel
            </h1>
          </div>
          <ShieldCheck className="w-7 h-7 text-[#d9272e]" />
        </div>

        <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-5">
          <div>
            <p className="text-sm text-slate-600">
              Sign in with your administrator credentials to manage website
              sections, projects, media, and customer enquiries.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
            >
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@contoursteel.co.in"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d1b2b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0d1b2b]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d9272e] hover:bg-[#b81f25] disabled:opacity-60 text-white font-bold text-sm py-3 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 border-t border-slate-100 text-center">
            <a
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-[#0d1b2b]"
            >
              ← Return to Live Website
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
