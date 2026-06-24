"use client";

import { useRef, useState } from "react";

type RowResult =
  | { row: number; status: "created"; username: string; email: string; tempPassword: string }
  | { row: number; status: "error"; error: string; username?: string };

const TEMPLATE =
  "username,firstName,middleName,lastName,email,role,payType,hourlyRate,monthlyRate,overtimeRate,leadUsername,defaultTrade,defaultClient\n" +
  "jdelacruz,Juan,,Dela Cruz,juan@example.com,employee,hourly,25,,,,Drywall,Acme Corp\n" +
  "mreyes,Maria,Q,Reyes,maria@example.com,employee,monthly,,4000,30,jdelacruz,Exterior,Acme Corp";

export default function BulkImport({ onImported }: { onImported: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RowResult[] | null>(null);
  const [summary, setSummary] = useState<{ created: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  async function importNow() {
    setError(null);
    setResults(null);
    setSummary(null);
    setBusy(true);
    try {
      const res = await fetch("/api/portal/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed.");
        return;
      }
      setResults(data.results ?? []);
      setSummary({ created: data.createdCount ?? 0, errors: data.errorCount ?? 0 });
      if ((data.createdCount ?? 0) > 0) onImported();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyCreated() {
    if (!results) return;
    const created = results.filter((r): r is Extract<RowResult, { status: "created" }> => r.status === "created");
    const text = created.map((r) => `${r.username}\t${r.email}\t${r.tempPassword}`).join("\n");
    navigator.clipboard?.writeText(`username\temail\ttempPassword\n${text}`);
  }

  function downloadCreated() {
    if (!results) return;
    const created = results.filter((r): r is Extract<RowResult, { status: "created" }> => r.status === "created");
    if (created.length === 0) return;
    const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const loginUrl = `${window.location.origin}/portal/login`;
    const header = "username,email,tempPassword,loginUrl";
    const lines = created.map((r) =>
      [r.username, r.email, r.tempPassword, loginUrl].map(cell).join(",")
    );
    // Prepend a UTF-8 BOM so Excel opens it cleanly.
    const csvText = "\uFEFF" + [header, ...lines].join("\r\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `staff-logins-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#059669]";

  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-900">Bulk import accounts</h3>
        <button
          type="button"
          onClick={downloadTemplate}
          className="text-sm font-semibold text-[#059669] hover:text-[#047857]"
        >
          Download CSV template
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Paste rows from your spreadsheet (or upload a .csv). The first line must be the header.
        Required columns: <code className="bg-gray-100 px-1 rounded">username</code>,{" "}
        <code className="bg-gray-100 px-1 rounded">email</code>. Optional: firstName, middleName,
        lastName, role, payType, hourlyRate, monthlyRate, overtimeRate, leadUsername, defaultTrade,
        defaultClient.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={8}
        placeholder={TEMPLATE}
        className={`${inputClass} font-mono`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={importNow}
          disabled={busy || !csv.trim()}
          className="bg-[#059669] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#047857] transition-colors disabled:opacity-60"
        >
          {busy ? "Importing…" : "Import"}
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Upload .csv
        </button>
        {csv && (
          <button
            type="button"
            onClick={() => setCsv("")}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 ml-auto"
          >
            Clear
          </button>
        )}
      </div>

      {summary && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
          <span className="font-semibold text-green-700">{summary.created} created</span>
          {summary.errors > 0 && (
            <span className="font-semibold text-red-600"> · {summary.errors} skipped</span>
          )}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Results</p>
            {results.some((r) => r.status === "created") && (
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={copyCreated}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Copy all logins
                </button>
                <button
                  type="button"
                  onClick={downloadCreated}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#059669] text-white px-3 py-1.5 text-xs font-semibold hover:bg-[#047857] transition-colors"
                >
                  Download logins (CSV)
                </button>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Username</th>
                  <th className="px-3 py-2 font-medium">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-500">{r.row}</td>
                    <td className="px-3 py-2 font-mono text-gray-800">{r.username ?? "—"}</td>
                    <td className="px-3 py-2">
                      {r.status === "created" ? (
                        <span className="text-green-700">
                          Created — temp password:{" "}
                          <code className="bg-green-50 border border-green-200 rounded px-2 py-0.5 font-mono">
                            {r.tempPassword}
                          </code>
                        </span>
                      ) : (
                        <span className="text-red-600">{r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Download or copy the temporary passwords now — they won&apos;t be shown again. The CSV
            includes each person&apos;s username, email, temp password, and the login link. Everyone is
            required to change their password on first login.
          </p>
        </div>
      )}
    </div>
  );
}
