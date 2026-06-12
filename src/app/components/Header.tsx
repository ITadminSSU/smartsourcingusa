"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const navLinkClass =
  "inline-flex items-center px-2.5 xl:px-3 py-2.5 text-xs xl:text-sm text-gray-800 hover:text-[#2c84c4] hover:bg-gray-50 rounded-md transition-colors font-semibold tracking-wide whitespace-nowrap min-h-[44px]";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");

  const navItems = [
    { href: "/about-us" as const, label: t("about") },
    { href: "/#services" as const, label: t("services") },
    { href: "/how-it-works" as const, label: t("howItWorks") },
    { href: "/case-studies" as const, label: t("caseStudies") },
    { href: "/our-team" as const, label: t("team") },
    { href: "/careers" as const, label: t("careers") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-4 xl:gap-6">
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center max-w-[9.5rem] sm:max-w-[11rem] xl:max-w-[12.5rem]"
        >
          <Image
            src="/horizontal-logo.png"
            alt="Smartsourcing USA"
            width={240}
            height={120}
            className="h-9 sm:h-10 xl:h-11 w-full max-w-full object-contain object-left"
            priority
          />
        </Link>

        <div className="hidden xl:flex flex-1 items-center min-w-0 gap-4 xl:gap-6">
          <div className="flex flex-1 items-center justify-center min-w-0 overflow-x-auto scrollbar-hide gap-0.5 xl:gap-1 2xl:gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navLinkClass}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5 xl:gap-6 shrink-0 pl-3 xl:pl-4 border-l border-gray-200">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className="inline-flex items-center ml-1 xl:ml-2 px-4 xl:px-5 py-2.5 text-sm bg-[#2c84c4] text-white rounded-lg hover:bg-[#2371a8] transition-all duration-200 font-semibold shadow-md hover:shadow-lg whitespace-nowrap min-h-[44px]"
            >
              {t("contact")}
            </Link>
          </div>
        </div>

        <div className="ml-auto hidden lg:flex xl:hidden items-center gap-4 shrink-0">
          <LanguageSwitcher />
          <Link
            href="/contact"
            className="inline-flex items-center ml-1 px-4 py-2.5 text-xs bg-[#2c84c4] text-white rounded-lg hover:bg-[#2371a8] transition-all duration-200 font-semibold shadow-md whitespace-nowrap min-h-[44px]"
          >
            {t("contact")}
          </Link>
          <button
            className="p-2.5 text-gray-800 hover:text-[#2c84c4] transition-colors rounded-lg hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <div className="ml-auto lg:hidden flex items-center gap-3 shrink-0">
          <LanguageSwitcher />
          <button
            className="p-2.5 text-gray-800 hover:text-[#2c84c4] transition-colors rounded-lg hover:bg-gray-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pb-5 pt-1 space-y-1 bg-white border-t border-gray-100">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-3 text-base text-gray-700 hover:text-[#2c84c4] hover:bg-gray-50 rounded-md transition-colors font-medium min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block mt-2 py-3 px-5 text-base bg-[#2c84c4] text-white rounded-md hover:bg-[#2371a8] transition-colors font-medium text-center min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("contact")}
          </Link>
        </div>
      </div>
    </header>
  );
}
