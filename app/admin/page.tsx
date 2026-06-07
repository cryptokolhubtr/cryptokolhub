"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) router.replace("/admin/dashboard");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        const d = await res.json();
        setError(d.error ?? "Invalid password");
        setLoading(false);
      }
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="CKH" className="w-14 h-14 object-contain mb-4" style={{ mixBlendMode: "screen" }} />
          <h1 className="text-white font-bold text-xl">Admin Panel</h1>
          <p className="text-white/40 text-sm mt-1">Crypto KOL Hub</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8"
        >
          <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
            autoFocus
            required
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl text-white px-4 py-3 text-sm outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all mb-4"
          />

          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold py-3 rounded-xl text-sm hover:from-indigo-500 hover:to-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
