"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PasswordField from "@/components/PasswordField";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
      <Image
        src="/login-logo.png"
        alt="Smart Sourcing USA"
        width={800}
        height={800}
        className="h-64 w-auto object-contain mb-4"
        style={{ height: "16rem", width: "auto" }}
        priority
      />
      <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-[#2c84c4] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
        Bids &amp; Metrics
      </span>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 border-t-4 border-t-[#2c84c4] p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bids &amp; Metrics Login</h1>
        <p className="text-sm text-gray-500 mb-6">Website content, case studies &amp; bid numbers</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
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
            className="w-full bg-[#2c84c4] text-white rounded-lg py-2.5 font-semibold hover:bg-[#2371a8] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
