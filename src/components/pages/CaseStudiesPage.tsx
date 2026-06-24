"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import AnimatedCounter from "@/components/AnimatedCounter";
import type { CaseStudyStats } from "@/lib/stats";

export default function CaseStudiesPage({ stats }: { stats: CaseStudyStats }) {
  const t = useTranslations("caseStudies");

  const counters = [
    { value: stats.totalBids, label: t("stats.totalBids"), money: false },
    { value: stats.exteriorBids, label: t("stats.exteriorBids"), money: false },
    { value: stats.drywallBids, label: t("stats.drywallBids"), money: false },
    { value: stats.exteriorAmount, label: t("stats.exteriorAmount"), money: true },
    { value: stats.drywallAmount, label: t("stats.drywallAmount"), money: true },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 border border-white/30">
            {t("hero.badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            {t("hero.title")} <span className="text-white/90">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/95 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("stats.sectionTitle")}{" "}
              <span className="text-[#2c84c4]">{t("stats.sectionTitleHighlight")}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("stats.sectionSubtitle")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-10 text-center">
            {counters.map((c, i) => (
              <div key={i} className="px-1">
                <div className="text-3xl sm:text-2xl lg:text-3xl font-bold text-[#2c84c4] mb-1.5 whitespace-nowrap tabular-nums tracking-tight leading-tight">
                  <AnimatedCounter
                    value={c.value}
                    prefix={c.money ? "$" : ""}
                    decimals={0}
                  />
                </div>
                <div className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wide leading-snug">
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t("cta.title")} <span className="text-white/90">{t("cta.titleHighlight")}</span>
          </h2>
          <p className="text-lg sm:text-xl text-white/95 mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-[#2c84c4] rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg text-center"
            >
              {t("cta.primaryButton")}
            </Link>
            <Link
              href="https://www.linkedin.com/company/smart-sourcing-usa/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors text-center"
            >
              {t("cta.secondaryButton")}
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/80">{t("cta.footnote")}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
