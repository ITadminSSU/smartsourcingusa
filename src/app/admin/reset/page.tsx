"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PasswordField from "@/components/PasswordField";
import { PASSWORD_RULES_TEXT } from "@/lib/password";

export default function AdminResetPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset password.");
        return;
      }
      setDone(true);
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
        className="h-40 w-auto object-contain mb-4"
        style={{ height: "10rem", width: "auto" }}
        priority
      />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 border-t-4 border-t-[#2c84c4] p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>

        {done ? (
          <div className="space-y-4 mt-4">
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
              Your password has been changed. You can now sign in.
            </div>
            <Link
              href="/admin/login"
              className="block text-center bg-[#2c84c4] text-white rounded-lg py-2.5 font-semibold hover:bg-[#2371a8] transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{PASSWORD_RULES_TEXT}</p>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <PasswordField
                  value={newPassword}
                  onChange={setNewPassword}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                <PasswordField
                  value={confirm}
                  onChange={setConfirm}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-[#2c84c4] text-white rounded-lg py-2.5 font-semibold hover:bg-[#2371a8] transition-colors disabled:opacity-60"
              >
                {loading ? "Saving…" : "Change password"}
              </button>
              {!token && (
                <p className="text-xs text-amber-700 text-center">
                  This page needs a valid reset link. Please use the link from your email.
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
