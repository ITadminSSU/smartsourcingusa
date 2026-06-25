"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PortalForgotPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/portal/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
    } catch {
      // Ignore — we always show the same confirmation for privacy.
    } finally {
      setSubmitted(true);
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
        className="h-40 w-auto object-contain mb-4"
        style={{ height: "10rem", width: "auto" }}
        priority
      />
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-gray-200 border-t-4 border-t-emerald-600 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your username or email and we&apos;ll send you a reset link.
        </p>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3">
              If an account matches that username or email, a password reset link has been sent.
              Check your inbox (and spam folder).
            </div>
            <Link
              href="/portal/login"
              className="block text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username or email</label>
              <input
                type="text"
                required
                autoCapitalize="none"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white rounded-lg py-2.5 font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
            <Link
              href="/portal/login"
              className="block text-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
