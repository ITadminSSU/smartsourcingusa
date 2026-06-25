import Link from "next/link";
import Image from "next/image";
import LogoutButton from "./LogoutButton";

// Shared header for all staff-portal pages. Green accent + logo so the payroll
// portal is instantly distinguishable from the blue /admin (bids) area.
export default function PortalHeader({
  title,
  subtitle = "Smart Sourcing USA — Staff Portal",
  backHref,
  backLabel = "Dashboard",
  meta,
  width = "max-w-5xl",
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  meta?: string;
  width?: string;
}) {
  return (
    <header className="bg-white border-b border-gray-200 border-t-4 border-t-emerald-600">
      <div className={`${width} mx-auto px-6 py-3 flex items-center justify-between gap-4`}>
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
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
            <p className="text-xs text-emerald-700 truncate">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {meta && <span className="text-sm text-gray-600 hidden sm:inline">{meta}</span>}
          {backHref && (
            <Link href={backHref} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              ← {backLabel}
            </Link>
          )}
          <Link href="/portal/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Profile
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
