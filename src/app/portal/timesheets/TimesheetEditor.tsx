"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type EditorEntry = {
  work_date: string;
  start_mst: string;
  end_mst: string;
  start_ph: string;
  end_ph: string;
  trade: string;
  client: string;
  hours: string;
  activity: string;
};

export type EditorInitial = {
  id: number;
  coverage_start: string;
  coverage_end: string;
  notes: string | null;
  entries: EditorEntry[];
};

type Props = {
  initial: EditorInitial | null;
  defaultTrade: string | null;
  defaultClient: string | null;
};

let rowCounter = 0;
function withKey(entry: EditorEntry) {
  return { key: `r${rowCounter++}`, ...entry };
}

function blankRow(trade: string | null, client: string | null): EditorEntry {
  return {
    work_date: "",
    start_mst: "",
    end_mst: "",
    start_ph: "",
    end_ph: "",
    trade: trade ?? "",
    client: client ?? "",
    hours: "",
    activity: "",
  };
}

export default function TimesheetEditor({ initial, defaultTrade, defaultClient }: Props) {
  const router = useRouter();
  const [coverageStart, setCoverageStart] = useState(initial?.coverage_start ?? "");
  const [coverageEnd, setCoverageEnd] = useState(initial?.coverage_end ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [rows, setRows] = useState(
    (initial?.entries.length
      ? initial.entries
      : [blankRow(defaultTrade, defaultClient)]
    ).map(withKey)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalHours = useMemo(
    () => rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0),
    [rows]
  );

  function updateRow(key: string, field: keyof EditorEntry, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, withKey(blankRow(defaultTrade, defaultClient))]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  async function persist(): Promise<number | null> {
    const payload = {
      coverageStart,
      coverageEnd,
      notes,
      entries: rows.map((r) => ({
        work_date: r.work_date,
        start_mst: r.start_mst,
        end_mst: r.end_mst,
        start_ph: r.start_ph,
        end_ph: r.end_ph,
        trade: r.trade,
        client: r.client,
        hours: Number(r.hours) || 0,
        activity: r.activity,
      })),
    };

    const url = initial ? `/api/portal/timesheets/${initial.id}` : "/api/portal/timesheets";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return null;
    }
    return initial ? initial.id : data.id;
  }

  async function saveDraft() {
    setError(null);
    if (!coverageStart || !coverageEnd) {
      setError("Please set the coverage start and end dates.");
      return;
    }
    setSaving(true);
    try {
      const id = await persist();
      if (id) {
        router.push(`/portal/timesheets/${id}`);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAndSubmit() {
    setError(null);
    if (!coverageStart || !coverageEnd) {
      setError("Please set the coverage start and end dates.");
      return;
    }
    if (totalHours <= 0) {
      setError("Add at least one entry with hours before submitting.");
      return;
    }
    setSaving(true);
    try {
      const id = await persist();
      if (!id) return;
      const res = await fetch(`/api/portal/timesheets/${id}/submit`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit.");
        return;
      }
      router.push(`/portal/timesheets/${id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]";
  const cellInput =
    "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#059669]";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage start *</label>
            <input type="date" className={inputClass} value={coverageStart} onChange={(e) => setCoverageStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage end *</label>
            <input type="date" className={inputClass} value={coverageEnd} onChange={(e) => setCoverageEnd(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-3 py-2 font-medium min-w-[140px]">Date</th>
                <th className="px-3 py-2 font-medium min-w-[90px]">Start (MST)</th>
                <th className="px-3 py-2 font-medium min-w-[90px]">End (MST)</th>
                <th className="px-3 py-2 font-medium min-w-[90px]">Start (PH)</th>
                <th className="px-3 py-2 font-medium min-w-[90px]">End (PH)</th>
                <th className="px-3 py-2 font-medium min-w-[120px]">Trade</th>
                <th className="px-3 py-2 font-medium min-w-[120px]">Client</th>
                <th className="px-3 py-2 font-medium min-w-[80px]">Hours</th>
                <th className="px-3 py-2 font-medium min-w-[200px]">Activity</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="px-2 py-1.5"><input type="date" className={cellInput} value={r.work_date} onChange={(e) => updateRow(r.key, "work_date", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} placeholder="6:00 PM" value={r.start_mst} onChange={(e) => updateRow(r.key, "start_mst", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} placeholder="2:00 AM" value={r.end_mst} onChange={(e) => updateRow(r.key, "end_mst", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} placeholder="9:00 AM" value={r.start_ph} onChange={(e) => updateRow(r.key, "start_ph", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} placeholder="5:00 PM" value={r.end_ph} onChange={(e) => updateRow(r.key, "end_ph", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} value={r.trade} onChange={(e) => updateRow(r.key, "trade", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} value={r.client} onChange={(e) => updateRow(r.key, "client", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input type="number" step="0.25" min="0" className={cellInput} value={r.hours} onChange={(e) => updateRow(r.key, "hours", e.target.value)} /></td>
                  <td className="px-2 py-1.5"><input className={cellInput} value={r.activity} onChange={(e) => updateRow(r.key, "activity", e.target.value)} /></td>
                  <td className="px-2 py-1.5 text-right">
                    <button type="button" onClick={() => removeRow(r.key)} className="text-xs text-red-600 hover:text-red-800" aria-label="Remove row">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-gray-800">
                <td className="px-3 py-2" colSpan={7}>Total hours</td>
                <td className="px-3 py-2">{totalHours.toFixed(2)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="p-3 border-t border-gray-100">
          <button type="button" onClick={addRow} className="text-sm font-semibold text-[#059669] hover:text-[#047857]">
            + Add row
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-gray-200 p-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea rows={3} className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything your reviewer should know" />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveDraft}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          onClick={saveAndSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[#059669] text-white font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
        >
          {saving ? "Submitting…" : "Submit for approval"}
        </button>
      </div>
    </div>
  );
}
