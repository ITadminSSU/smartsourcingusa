"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PasswordField from "@/components/PasswordField";

export default function PortalLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push(data.mustChange ? "/portal/onboarding" : "/portal");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white">
      <Image
        src="/login-logo.png"
        alt="Smart Sourcing USA"
        width={800}
        height={800}
        className="h-64 w-auto object-contain mb-4"
        style={{ height: "16rem", width: "auto" }}
        priority
      />
      <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
        Payroll &amp; Timesheets
      </span>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 border-t-4 border-t-emerald-600 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Staff Payroll Portal</h1>
        <p className="text-sm text-gray-500 mb-6">Timesheets, invoices &amp; payroll</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              required
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <PasswordField
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/portal/forgot"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
