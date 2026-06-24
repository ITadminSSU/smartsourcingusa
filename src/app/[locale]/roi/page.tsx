"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ROICalculator from "@/app/components/roi/ROICalculator";
import HowItWorks from "@/app/components/roi/HowItWorks";
import OvercomeFears from "@/app/components/roi/OvercomeFears";
import Pricing from "@/app/components/roi/Pricing";
import FAQ from "@/app/components/roi/FAQ";

export default function ROIPage() {
  const t = useTranslations("roi.nav");
  const [activePage, setActivePage] = useState("roi");

  const pages = [
    { id: "roi", label: t("roiCalculator") },
    { id: "how-it-works", label: t("howItWorks") },
    { id: "engineers", label: t("meetEngineers") },
    { id: "case-studies", label: t("caseStudies") },
    { id: "fears", label: t("overcomeFears") },
    { id: "pricing", label: t("pricing") },
    { id: "faq", label: t("faq") },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <div className="bg-white border-b border-gray-200">
        <div className="roi-nav-container flex">
          {pages.map((page) =>
            page.id === "engineers" ? (
              <Link
                key={page.id}
                href="/our-team"
                className="roi-nav-button transition-all bg-transparent text-black font-medium hover:bg-gray-100"
              >
                {page.label}
              </Link>
            ) : page.id === "case-studies" ? (
              <Link
                key={page.id}
                href="/case-studies"
                className="roi-nav-button transition-all bg-transparent text-black font-medium hover:bg-gray-100"
              >
                {page.label}
              </Link>
            ) : (
              <button
                key={page.id}
                onClick={() => {
                  setActivePage(page.id);
                  window.scrollTo(0, 0);
                }}
                className={`roi-nav-button transition-all ${
                  activePage === page.id
                    ? "roi-nav-button-active bg-[#2c84c4] text-white font-semibold"
                    : "bg-transparent text-black font-medium hover:bg-gray-100"
                }`}
              >
                {page.label}
              </button>
            )
          )}
        </div>
      </div>

      {activePage === "roi" && <ROICalculator />}
      {activePage === "how-it-works" && <HowItWorks />}
      {activePage === "fears" && <OvercomeFears />}
      {activePage === "pricing" && <Pricing />}
      {activePage === "faq" && <FAQ />}

      <Footer />
    </div>
  );
}
