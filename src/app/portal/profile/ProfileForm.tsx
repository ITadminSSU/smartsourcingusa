"use client";

import { useState } from "react";

type Account = {
  username: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  role: string;
};

type Bank = { set: boolean; bankName: string | null; accountMasked: string | null };

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  lead: "Team Lead",
  accounting: "Accounting",
  hr_admin: "Admin",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]";

function Banner({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        kind === "ok"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-700"
      }`}
    >
      {children}
    </div>
  );
}

export default function ProfileForm({
  initialAccount,
  initialBank,
}: {
  initialAccount: Account;
  initialBank: Bank;
}) {
  // --- Personal info ---
  const [firstName, setFirstName] = useState(initialAccount.firstName);
  const [middleName, setMiddleName] = useState(initialAccount.middleName);
  const [lastName, setLastName] = useState(initialAccount.lastName);
  const [email, setEmail] = useState(initialAccount.email);
  const [infoMsg, setInfoMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);

  // --- Password ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  // --- Bank ---
  const [bank, setBank] = useState<Bank>(initialBank);
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankMsg, setBankMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [savingBank, setSavingBank] = useState(false);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, middleName, lastName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInfoMsg({ kind: "error", text: data.error ?? "Could not save." });
        return;
      }
      setInfoMsg({ kind: "ok", text: "Profile updated." });
    } catch {
      setInfoMsg({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ kind: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ kind: "error", text: "New passwords do not match." });
      return;
    }
    setSavingPw(true);
    try {
      const res = await fetch("/api/portal/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ kind: "error", text: data.error ?? "Could not change password." });
        return;
      }
      setPwMsg({ kind: "ok", text: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPwMsg({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setSavingPw(false);
    }
  }

  async function saveBank(e: React.FormEvent) {
    e.preventDefault();
    setBankMsg(null);
    setSavingBank(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, bankAccount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBankMsg({ kind: "error", text: data.error ?? "Could not save bank details." });
        return;
      }
      setBankMsg({ kind: "ok", text: "Bank details saved." });
      setBank({
        set: true,
        bankName,
        accountMasked: "****" + bankAccount.replace(/\s+/g, "").slice(-4),
      });
      setBankName("");
      setBankAccount("");
    } catch {
      setBankMsg({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setSavingBank(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account summary */}
      <section className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Username</p>
            <p className="font-mono text-gray-900">{initialAccount.username}</p>
          </div>
          <div>
            <p className="text-gray-500">Role</p>
            <p className="text-gray-900">{ROLE_LABELS[initialAccount.role] ?? initialAccount.role}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Username and role are managed by an admin. Contact them if these need to change.
        </p>
      </section>

      {/* Personal info */}
      <section className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Personal information</h2>
        {infoMsg && (
          <div className="mb-4">
            <Banner kind={infoMsg.kind}>{infoMsg.text}</Banner>
          </div>
        )}
        <form onSubmit={saveInfo} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
              <input className={inputClass} required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle name</label>
              <input className={inputClass} value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
              <input className={inputClass} required value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className={inputClass} required value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="mt-1 text-xs text-gray-400">Used for notifications (timesheets, invoices, approvals).</p>
          </div>
          <button
            type="submit"
            disabled={savingInfo}
            className="bg-[#059669] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
          >
            {savingInfo ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
        {pwMsg && (
          <div className="mb-4">
            <Banner kind={pwMsg.kind}>{pwMsg.text}</Banner>
          </div>
        )}
        <form onSubmit={savePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current password *</label>
            <input
              type="password"
              className={inputClass}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password *</label>
            <input
              type="password"
              className={inputClass}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password *</label>
            <input
              type="password"
              className={inputClass}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={savingPw}
            className="bg-[#059669] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
          >
            {savingPw ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>

      {/* Bank details */}
      <section className="rounded-xl bg-white border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Bank details</h2>
        <p className="text-sm text-gray-500 mb-4">
          Encrypted and only visible to you and accounting. Used for invoice payments.
        </p>
        {bank.set ? (
          <div className="mb-4 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
            <span className="text-gray-500">On file: </span>
            <span className="text-gray-900 font-medium">{bank.bankName}</span>
            <span className="text-gray-400"> · </span>
            <span className="font-mono text-gray-700">{bank.accountMasked}</span>
          </div>
        ) : (
          <div className="mb-4">
            <Banner kind="error">No bank details on file yet — add them so invoices can be paid.</Banner>
          </div>
        )}
        {bankMsg && (
          <div className="mb-4">
            <Banner kind={bankMsg.kind}>{bankMsg.text}</Banner>
          </div>
        )}
        <form onSubmit={saveBank} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank name *</label>
            <input className={inputClass} required value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Wise" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account number *</label>
            <input className={inputClass} required value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Your account number" />
          </div>
          <button
            type="submit"
            disabled={savingBank}
            className="bg-[#059669] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
          >
            {savingBank ? "Saving…" : bank.set ? "Update bank details" : "Save bank details"}
          </button>
        </form>
      </section>
    </div>
  );
}
