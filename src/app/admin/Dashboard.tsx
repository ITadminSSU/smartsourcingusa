"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PasswordField from "@/components/PasswordField";
import type { CaseStudyStats } from "@/lib/stats";
import type { UserRole } from "@/lib/session";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

type ActivityEntry = {
  id: number;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};

const STAT_FIELDS: { key: keyof CaseStudyStats; label: string; money: boolean }[] = [
  { key: "totalBids", label: "Total number of bids", money: false },
  { key: "exteriorBids", label: "Bids for exterior", money: false },
  { key: "drywallBids", label: "Bids for drywall", money: false },
  { key: "exteriorAmount", label: "Exterior bid amount ($)", money: true },
  { key: "drywallAmount", label: "Drywall amount ($)", money: true },
];

const ACTION_LABELS: Record<string, string> = {
  stats_update: "Updated numbers",
  user_added: "Added team member",
  user_removed: "Removed team member",
  login: "Signed in",
  setup: "Created first admin",
};

function formatWhen(value: string): string {
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function Dashboard({
  user,
  initialStats,
}: {
  user: { name: string; email: string; role: UserRole };
  initialStats: CaseStudyStats;
}) {
  const router = useRouter();
  const isAdmin = user.role === "admin";

  const [stats, setStats] = useState<Record<keyof CaseStudyStats, string>>({
    totalBids: String(initialStats.totalBids),
    exteriorBids: String(initialStats.exteriorBids),
    drywallBids: String(initialStats.drywallBids),
    exteriorAmount: String(initialStats.exteriorAmount),
    drywallAmount: String(initialStats.drywallAmount),
  });
  const [statsMsg, setStatsMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingStats, setSavingStats] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as UserRole,
  });
  const [userMsg, setUserMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [addingUser, setAddingUser] = useState(false);

  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setCurrentUserId(data.currentUserId);
    }
  }, [isAdmin]);

  const loadActivity = useCallback(async () => {
    const res = await fetch("/api/admin/activity");
    if (res.ok) {
      const data = await res.json();
      setActivity(data.activity);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadActivity();
  }, [loadUsers, loadActivity]);

  async function saveStats(e: React.FormEvent) {
    e.preventDefault();
    setStatsMsg(null);
    setSavingStats(true);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatsMsg({ type: "err", text: data.error ?? "Could not save." });
        return;
      }
      setStatsMsg({ type: "ok", text: "Saved! The website now shows these numbers." });
      loadActivity();
    } catch {
      setStatsMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setSavingStats(false);
    }
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setUserMsg(null);
    setAddingUser(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserMsg({ type: "err", text: data.error ?? "Could not add user." });
        return;
      }
      setUserMsg({ type: "ok", text: "Team member added." });
      setNewUser({ name: "", email: "", password: "", role: "editor" });
      loadUsers();
      loadActivity();
    } catch {
      setUserMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setAddingUser(false);
    }
  }

  async function removeUser(id: number) {
    if (!confirm("Remove this team member's access?")) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setUserMsg({ type: "err", text: data.error ?? "Could not remove user." });
      return;
    }
    loadUsers();
    loadActivity();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 border-t-4 border-t-[#2c84c4]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/login-logo.png"
              alt="Smart Sourcing USA"
              width={160}
              height={160}
              className="h-10 w-auto object-contain shrink-0"
              style={{ height: "2.5rem", width: "auto" }}
              priority
            />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Bids &amp; Metrics</h1>
              <p className="text-xs text-[#2c84c4] truncate">Smart Sourcing USA — Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm text-gray-600 hidden sm:inline">
              {user.name}
              <span
                className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isAdmin ? "bg-[#2c84c4]/10 text-[#2c84c4]" : "bg-gray-100 text-gray-600"
                }`}
              >
                {isAdmin ? "Admin" : "Editor"}
              </span>
            </span>
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-4 py-2 bg-white"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Case Studies numbers</h2>
        <p className="text-sm text-gray-500 mb-6">
          These appear as animated counters on the public Case Studies page.
        </p>

        {statsMsg && (
          <div
            className={`mb-4 rounded-lg text-sm px-4 py-3 border ${
              statsMsg.type === "ok"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {statsMsg.text}
          </div>
        )}

        <form onSubmit={saveStats} className="space-y-4">
          {STAT_FIELDS.map((f) => (
            <div key={f.key} className="grid sm:grid-cols-2 gap-2 sm:items-center">
              <label className="text-sm font-medium text-gray-700">{f.label}</label>
              <div className="relative">
                {f.money && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                )}
                <input
                  type="number"
                  min="0"
                  step={f.money ? "0.01" : "1"}
                  required
                  value={stats[f.key]}
                  onChange={(e) => setStats({ ...stats, [f.key]: e.target.value })}
                  className={`w-full rounded-lg border border-gray-300 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4] ${
                    f.money ? "pl-7 pr-3" : "px-3"
                  }`}
                />
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={savingStats}
            className="bg-[#2c84c4] text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-[#2371a8] transition-colors disabled:opacity-60"
          >
            {savingStats ? "Saving…" : "Save numbers"}
          </button>
        </form>
      </section>

      {isAdmin && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Team access</h2>
          <p className="text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-700">Admins</span> can edit numbers and manage the
            team. <span className="font-medium text-gray-700">Editors</span> can edit numbers only.
          </p>

          {userMsg && (
            <div
              className={`mb-4 rounded-lg text-sm px-4 py-3 border ${
                userMsg.type === "ok"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {userMsg.text}
            </div>
          )}

          <div className="divide-y divide-gray-100 mb-6">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {u.name}
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-[#2c84c4]/10 text-[#2c84c4]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "Editor"}
                    </span>
                    {u.id === currentUserId && <span className="text-xs text-gray-400">(you)</span>}
                  </div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </div>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => removeUser(u.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={addUser} className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            />
            <PasswordField
              value={newUser.password}
              onChange={(v) => setNewUser({ ...newUser, password: v })}
              required
              minLength={8}
              placeholder="Password (min 8)"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 pl-3 pr-12 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            >
              <option value="editor">Editor (numbers only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
            <button
              type="submit"
              disabled={addingUser}
              className="sm:col-span-2 justify-self-start bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60"
            >
              {addingUser ? "Adding…" : "Add team member"}
            </button>
          </form>
        </section>
      )}

      <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Recent activity</h2>
        <p className="text-sm text-gray-500 mb-6">A log of who changed what, and when.</p>

        {activity.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {activity.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {ACTION_LABELS[a.action] ?? a.action}
                    </div>
                    {a.detail && <div className="text-sm text-gray-600">{a.detail}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {a.actor_name ?? a.actor_email ?? "Unknown"}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatWhen(a.created_at)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </div>
  );
}
