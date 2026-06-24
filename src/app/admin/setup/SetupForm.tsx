"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/PasswordField";

export default function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Setup failed.");
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create admin account</h1>
        <p className="text-sm text-gray-500 mb-6">
          This is a one-time setup for the first administrator.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-gray-400">(min 8 characters)</span>
            </label>
            <PasswordField
              value={password}
              onChange={setPassword}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2c84c4] text-white rounded-lg py-2.5 font-semibold hover:bg-[#2371a8] transition-colors disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
