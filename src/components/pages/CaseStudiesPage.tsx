"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type Metric = { value: string; label: string };
type PainPoint = { emoji: string; title: string; description: string };
type StudyMetric = { label: string; value: string };
type Step = { title: string; description: string };
type FinancialCard = { icon: string; title: string; description: string };
type FaqItem = { question: string; answer: string };
type ComparisonRow = { metric: string; residential: string; commercial: string };

export default function CaseStudiesPage() {
  const t = useTranslations("caseStudies");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const heroMetrics = t.raw("hero.metrics") as Metric[];
  const painPoints = t.raw("painPoints.items") as PainPoint[];
  const whyStats = t.raw("whyAsphalt.stats") as Metric[];
  const residentialMetrics = t.raw("studies.residential.metrics") as StudyMetric[];
  const commercialMetrics = t.raw("studies.commercial.metrics") as StudyMetric[];
  const comparisonRows = t.raw("studies.comparison.rows") as ComparisonRow[];
  const steps = t.raw("howItWorks.steps") as Step[];
  const financialCards = t.raw("financialCase.cards") as FinancialCard[];
  const faqItems = t.raw("faq.items") as FaqItem[];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 border border-white/30">
              {t("hero.badge")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <span className="text-white/90">{t("hero.titleHighlight")}</span>
              <br />
              {t("hero.titleLine2")}
            </h1>
            <p className="text-lg sm:text-xl text-white/95 max-w-3xl mx-auto mb-8">{t("hero.subtitle")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mt-10">
              {heroMetrics.map((m, i) => (
                <div key={i} className={`text-center ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">{m.value}</div>
                  <div className="text-xs sm:text-sm text-white/80 uppercase tracking-wide">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block bg-[#2c84c4]/10 text-[#2c84c4] px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-[#2c84c4]/20">
              {t("whyAsphalt.badge")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("whyAsphalt.title")} <span className="text-[#2c84c4]">{t("whyAsphalt.titleHighlight")}</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 mb-6 leading-relaxed">{t("whyAsphalt.paragraph1")}</p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              {t("whyAsphalt.paragraph2BeforeBold1")}
              <strong className="text-gray-900">{t("whyAsphalt.paragraph2Bold1")}</strong>
              {t("whyAsphalt.paragraph2Middle")}
              <strong className="text-gray-900">{t("whyAsphalt.paragraph2Bold2")}</strong>
              {t("whyAsphalt.paragraph2AfterBold2")}
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              {t("whyAsphalt.paragraph3BeforeBold")}
              <strong className="text-[#2c84c4]">{t("whyAsphalt.paragraph3Bold")}</strong>
              {t("whyAsphalt.paragraph3AfterBold")}
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
              {t("whyAsphalt.paragraph4BeforeBold")}
              <strong className="text-gray-900">{t("whyAsphalt.paragraph4Bold")}</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              {whyStats.map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-[#2c84c4] mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-red-600 mb-4">{t("painPoints.title")}</h2>
            <p className="text-lg text-gray-700">{t("painPoints.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {painPoints.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-red-200 text-center">
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h4 className="font-semibold text-red-600 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("studies.title")} <span className="text-[#2c84c4]">{t("studies.titleHighlight")}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("studies.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl border-2 border-orange-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 border-b-2 border-orange-300">
                <span className="inline-block bg-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 border border-orange-300">
                  {t("studies.residential.badge")}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("studies.residential.title")}</h3>
                <p className="text-sm text-gray-600">{t("studies.residential.location")}</p>
              </div>
              <div className="p-6 space-y-4">
                {residentialMetrics.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-700">{m.label}</span>
                    <span className="text-lg font-bold text-orange-600">{m.value}</span>
                  </div>
                ))}
                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 text-center mt-6">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{t("studies.residential.highlightValue")}</div>
                  <div className="text-sm text-gray-600">{t("studies.residential.highlightLabel")}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#2c84c4] shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-[#2c84c4]/10 to-[#2c84c4]/5 p-6 border-b-2 border-[#2c84c4]">
                <span className="inline-block bg-[#2c84c4]/20 text-[#2c84c4] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 border border-[#2c84c4]/30">
                  {t("studies.commercial.badge")}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t("studies.commercial.title")}</h3>
                <p className="text-sm text-gray-600">{t("studies.commercial.location")}</p>
              </div>
              <div className="p-6 space-y-4">
                {commercialMetrics.map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-700">{m.label}</span>
                    <span className="text-lg font-bold text-[#2c84c4]">{m.value}</span>
                  </div>
                ))}
                <div className="bg-[#2c84c4]/10 rounded-xl p-6 border border-[#2c84c4]/20 text-center mt-6">
                  <div className="text-4xl font-bold text-[#2c84c4] mb-2">{t("studies.commercial.highlightValue")}</div>
                  <div className="text-sm text-gray-600">{t("studies.commercial.highlightLabel")}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-10">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#2c84c4] text-white">
                  <th className="p-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-white/20">
                    {t("studies.comparison.headerMetric")}
                  </th>
                  <th className="p-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-white/20">
                    {t("studies.comparison.headerResidential")}
                  </th>
                  <th className="p-4 text-left text-sm font-bold uppercase tracking-wide border-b-2 border-white/20">
                    {t("studies.comparison.headerCommercial")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-700">{row.metric}</td>
                    <td className="p-4 text-sm font-semibold text-orange-600">{row.residential}</td>
                    <td className="p-4 text-sm font-semibold text-[#2c84c4]">{row.commercial}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("howItWorks.title")} <span className="text-[#2c84c4]">{t("howItWorks.titleHighlight")}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("howItWorks.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-[#2c84c4] to-[#2371a8] rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("financialCase.title")} <span className="text-[#2c84c4]">{t("financialCase.titleHighlight")}</span>{" "}
              {t("financialCase.titleSuffix")}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("financialCase.subtitle")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {financialCards.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="text-base font-semibold text-[#2c84c4] mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t("faq.title")} <span className="text-[#2c84c4]">{t("faq.titleHighlight")}</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <span className={`text-2xl text-[#2c84c4] transition-transform flex-shrink-0 ${openFaq === idx ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-400 ${openFaq === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="p-5 pt-0 text-gray-600 leading-relaxed">{faq.answer}</div>
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
          <p className="text-lg sm:text-xl text-white/95 mb-8 max-w-2xl mx-auto">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 bg-white text-[#2c84c4] rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg text-center">
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
