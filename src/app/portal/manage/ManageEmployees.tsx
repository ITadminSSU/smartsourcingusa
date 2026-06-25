"use client";

import { useEffect, useState } from "react";
import BulkImport from "./BulkImport";

type EmployeeRow = {
  id: number;
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: string;
  active: number;
  must_change_password: number;
  pay_type: string | null;
  hourly_rate: string | null;
  monthly_rate: string | null;
  overtime_rate: string | null;
  default_trade: string | null;
  default_client: string | null;
  bank_set: number | null;
  lead_user_id: number | null;
  lead_name: string | null;
};

type LeadOption = { id: number; name: string; role: string };

const ROLE_LABELS: Record<string, string> = {
  employee: "Employee",
  lead: "Team Lead",
  accounting: "Accounting",
  hr_admin: "Admin",
};

const EMPTY_FORM = {
  username: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  role: "employee",
  payType: "hourly",
  hourlyRate: "",
  monthlyRate: "",
  overtimeRate: "",
  leadUserId: "",
  defaultTrade: "",
  defaultClient: "",
};

function fullName(e: EmployeeRow) {
  return [e.first_name, e.middle_name, e.last_name].filter(Boolean).join(" ");
}

function money(v: string | null) {
  if (v === null || v === "") return "—";
  return `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ManageEmployees() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<{ username: string; email: string; tempPassword: string; reset?: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/employees");
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees ?? []);
        setLeads(data.leads ?? []);
        setCurrentUserId(data.currentUserId ?? null);
      } else {
        setError(data.error ?? "Failed to load employees.");
      }
    } catch {
      setError("Network error loading employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setCreated(null);
    setError(null);
    setShowForm(true);
  }

  function startEdit(emp: EmployeeRow) {
    setEditingId(emp.id);
    setCreated(null);
    setError(null);
    setForm({
      username: emp.username ?? "",
      firstName: emp.first_name ?? "",
      middleName: emp.middle_name ?? "",
      lastName: emp.last_name ?? "",
      email: emp.email ?? "",
      role: emp.role ?? "employee",
      payType: emp.pay_type ?? "hourly",
      hourlyRate: emp.hourly_rate ?? "",
      monthlyRate: emp.monthly_rate ?? "",
      overtimeRate: emp.overtime_rate ?? "",
      leadUserId: emp.lead_user_id ? String(emp.lead_user_id) : "",
      defaultTrade: emp.default_trade ?? "",
      defaultClient: emp.default_client ?? "",
    });
    setShowForm(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/portal/employees", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editingId ?? undefined,
          leadUserId: form.leadUserId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (editingId ? "Could not update account." : "Could not create account."));
        return;
      }
      if (!editingId) {
        setCreated({ username: data.username, email: data.email, tempPassword: data.tempPassword });
      }
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      setEditingId(null);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function resetPassword(emp: EmployeeRow) {
    if (
      !confirm(
        `Reset password for ${fullName(emp)}?\n\nTheir current password will stop working and a new temporary password will be generated. You'll need to send it to them.`
      )
    )
      return;
    setError(null);
    try {
      const res = await fetch(`/api/portal/employees/${emp.id}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset password.");
        return;
      }
      setCreated({
        username: data.username,
        email: data.email,
        tempPassword: data.tempPassword,
        reset: true,
      });
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      await load();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function remove(emp: EmployeeRow) {
    if (!confirm(`Remove ${fullName(emp)}? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch("/api/portal/employees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: emp.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not remove account.");
        return;
      }
      await load();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      {created && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-900">
          <p className="font-semibold mb-1">
            {created.reset ? "Password reset for " : "Account created for "}
            {created.email}
          </p>
          <p className="mb-2">
            Share these login details with the employee. The password won&apos;t be shown again — they&apos;ll
            be asked to change it on first login.
          </p>
          <div className="mb-2">
            <span className="text-green-800">Username: </span>
            <code className="bg-white border border-green-300 rounded px-2 py-0.5 font-mono">
              {created.username}
            </code>
          </div>
          <div className="flex items-center gap-3">
            <code className="bg-white border border-green-300 rounded px-3 py-1.5 font-mono text-base">
              {created.tempPassword}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(created.tempPassword)}
              className="text-xs font-semibold text-green-800 underline hover:no-underline"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() => setCreated(null)}
              className="text-xs font-medium text-green-700 ml-auto"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Team members <span className="text-gray-400 font-normal">({employees.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShowBulk((s) => !s);
              setShowForm(false);
              setEditingId(null);
            }}
            className="bg-white text-[#059669] border border-[#059669] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            {showBulk ? "Close import" : "Bulk import"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBulk(false);
              if (showForm) {
                setShowForm(false);
                setEditingId(null);
              } else {
                startCreate();
              }
            }}
            className="bg-[#059669] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#047857] transition-colors"
          >
            {showForm ? "Cancel" : "+ New account"}
          </button>
        </div>
      </div>

      {showBulk && <BulkImport onImported={load} />}

      {showForm && (
        <form onSubmit={submit} className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">
            {editingId ? "Edit account" : "New account"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input
                className={inputClass}
                required
                autoCapitalize="none"
                placeholder="e.g. jdelacruz"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">Used to log in. Letters, numbers, . _ - only.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" className={inputClass} required value={form.email} onChange={(e) => update("email", e.target.value)} />
              <p className="mt-1 text-xs text-gray-400">Any email they use — for notifications.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
              <input className={inputClass} required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle name</label>
              <input className={inputClass} value={form.middleName} onChange={(e) => update("middleName", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
              <input className={inputClass} required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select className={inputClass} value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="employee">Employee</option>
                <option value="lead">Team Lead</option>
                <option value="accounting">Accounting</option>
                <option value="hr_admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay type *</label>
              <select className={inputClass} value={form.payType} onChange={(e) => update("payType", e.target.value)}>
                <option value="hourly">Hourly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {form.payType === "hourly" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly rate ($) *</label>
                <input type="number" step="0.01" min="0" className={inputClass} value={form.hourlyRate} onChange={(e) => update("hourlyRate", e.target.value)} />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly rate ($) *</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={form.monthlyRate} onChange={(e) => update("monthlyRate", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Overtime hourly rate ($)</label>
                  <input type="number" step="0.01" min="0" className={inputClass} value={form.overtimeRate} onChange={(e) => update("overtimeRate", e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team lead</label>
              <select className={inputClass} value={form.leadUserId} onChange={(e) => update("leadUserId", e.target.value)}>
                <option value="">None (accounting approves)</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({ROLE_LABELS[l.role] ?? l.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default trade</label>
              <input className={inputClass} value={form.defaultTrade} onChange={(e) => update("defaultTrade", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default client</label>
              <input className={inputClass} value={form.defaultClient} onChange={(e) => update("defaultClient", e.target.value)} />
            </div>
          </div>

          {editingId ? (
            <p className="text-xs text-gray-500">
              Changing the username changes how this person logs in. The password is not affected here.
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              A temporary password is generated automatically. Bank details are entered by the employee on
              first login.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#059669] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
            >
              {saving
                ? editingId
                  ? "Saving…"
                  : "Creating…"
                : editingId
                  ? "Save changes"
                  : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setError(null);
              }}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading…</p>
        ) : employees.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No team members yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Pay</th>
                  <th className="px-4 py-3 font-medium">Team lead</th>
                  <th className="px-4 py-3 font-medium">Bank</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{fullName(e)}</div>
                      <div className="text-xs text-gray-500">
                        <span className="font-mono text-gray-600">@{e.username}</span> · {e.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{ROLE_LABELS[e.role] ?? e.role}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {e.pay_type === "monthly"
                        ? `${money(e.monthly_rate)}/mo`
                        : `${money(e.hourly_rate)}/hr`}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.lead_name || "—"}</td>
                    <td className="px-4 py-3">
                      {e.bank_set ? (
                        <span className="text-green-700 text-xs font-medium">Set</span>
                      ) : (
                        <span className="text-amber-600 text-xs font-medium">Missing</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {e.must_change_password ? (
                        <span className="text-xs text-gray-500">Pending first login</span>
                      ) : (
                        <span className="text-xs text-green-700">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        className="text-xs font-medium text-[#059669] hover:text-[#047857]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => resetPassword(e)}
                        className="text-xs font-medium text-amber-600 hover:text-amber-800 ml-3"
                      >
                        Reset password
                      </button>
                      {e.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => remove(e)}
                          className="text-xs font-medium text-red-600 hover:text-red-800 ml-3"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
