"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordField from "@/components/PasswordField";

type Props = {
  name: string;
  needsPassword: boolean;
  bankAlreadySet: boolean;
};

type Step = "password" | "bank" | "done";

export default function OnboardingForm({ name, needsPassword, bankAlreadySet }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    needsPassword ? "password" : bankAlreadySet ? "done" : "bank"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  function finish() {
    router.push("/portal");
    router.refresh();
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/portal/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update password.");
        return;
      }
      if (bankAlreadySet) finish();
      else setStep("bank");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitBank(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, bankAccount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save bank details.");
        return;
      }
      finish();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {name.split(" ")[0]}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {step === "password"
            ? "First, set a new password for your account."
            : "Almost done — add your bank details for invoice payments."}
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {step === "password" && (
          <form onSubmit={submitPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New password <span className="text-gray-400">(min 8 characters)</span>
              </label>
              <PasswordField value={newPassword} onChange={setNewPassword} required minLength={8} autoComplete="new-password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <PasswordField value={confirmPassword} onChange={setConfirmPassword} required minLength={8} autoComplete="new-password" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#059669] text-white rounded-lg py-2.5 font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save password"}
            </button>
          </form>
        )}

        {step === "bank" && (
          <form onSubmit={submitBank} className="space-y-4">
            <div className="rounded-lg bg-[#059669]/5 border border-[#059669]/20 px-4 py-3 text-xs text-gray-600">
              Your bank details are encrypted and only visible to you and accounting.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank name</label>
              <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} placeholder="e.g. Wise" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account number</label>
              <input type="text" required value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className={inputClass} placeholder="Your account number" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#059669] text-white rounded-lg py-2.5 font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
            >
              {loading ? "Saving…" : "Finish setup"}
            </button>
          </form>
        )}

        {step === "done" && (
          <button
            type="button"
            onClick={finish}
            className="w-full bg-[#059669] text-white rounded-lg py-2.5 font-semibold hover:bg-[#047857] transition-colors"
          >
            Go to portal
          </button>
        )}
      </div>
    </div>
  );
}
