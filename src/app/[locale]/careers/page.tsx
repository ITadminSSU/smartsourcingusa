"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function CareersPage() {
  const t = useTranslations("careers");

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <span className="text-white/80">{t("hero.titleHighlight")}</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block bg-[#2c84c4]/10 text-[#2c84c4] px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-8 border border-[#2c84c4]/20">
            {t("comingSoon.badge")}
          </span>
          <div className="text-5xl mb-6" aria-hidden>
            🚀
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("comingSoon.title")}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">{t("comingSoon.description")}</p>
          <p className="text-base text-gray-500 leading-relaxed mb-10">{t("comingSoon.note")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#2c84c4] text-white rounded-lg font-semibold hover:bg-[#2371a8] transition-colors shadow-lg"
            >
              {t("comingSoon.contactButton")}
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-white border-2 border-[#2c84c4] text-[#2c84c4] rounded-lg font-semibold hover:bg-[#2c84c4] hover:text-white transition-colors"
            >
              {t("comingSoon.homeButton")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
