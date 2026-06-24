"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayButton({ id }: { id: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markPaid() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/portal/invoices/${id}/pay`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not mark paid.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={markPaid}
        disabled={busy}
        className="bg-green-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
      >
        {busy ? "Saving…" : "Mark as paid"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
