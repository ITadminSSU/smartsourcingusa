"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewActions({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setError(null);
    setBusy("approve");
    try {
      const res = await fetch(`/api/portal/approvals/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not approve.");
      router.push("/portal/approvals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  async function reject() {
    setError(null);
    if (!notes.trim()) {
      setError("Please add a reason so the employee knows what to fix.");
      return;
    }
    setBusy("reject");
    try {
      const res = await fetch(`/api/portal/approvals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not send back.");
      router.push("/portal/approvals");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Decision</h3>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!showReject ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={approve}
            disabled={busy !== null}
            className="bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {busy === "approve" ? "Approving…" : "Approve"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={busy !== null}
            className="bg-white text-red-700 border border-red-300 rounded-lg px-5 py-2 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
          >
            Send back
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Reason for sending back
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Friday's hours look off — please double-check the PH end time."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#059669] focus:outline-none focus:ring-1 focus:ring-[#059669]"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={reject}
              disabled={busy !== null}
              className="bg-red-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {busy === "reject" ? "Sending…" : "Confirm send back"}
            </button>
            <button
              onClick={() => {
                setShowReject(false);
                setError(null);
              }}
              disabled={busy !== null}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Approving finalizes the timesheet. Sending it back lets the employee edit and resubmit.
      </p>
    </div>
  );
}
