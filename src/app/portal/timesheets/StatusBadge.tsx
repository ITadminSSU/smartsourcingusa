const META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", cls: "bg-blue-100 text-blue-700" },
  lead_approved: { label: "Lead approved", cls: "bg-indigo-100 text-indigo-700" },
  approved: { label: "Approved", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Sent back", cls: "bg-red-100 text-red-700" },
  invoiced: { label: "Invoiced", cls: "bg-purple-100 text-purple-700" },
};

export default function StatusBadge({ status }: { status: string }) {
  const meta = META[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}
