"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type FaqItem = { question: string; answer: string };

export default function FAQPage() {
  const t = useTranslations("faq");
  const faqs = t.raw("items") as FaqItem[];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <span className="text-white/80">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="text-lg font-bold text-gray-900">{faq.question}</span>
                  <span className={`transform transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""}`}>
                    <svg className="w-6 h-6 text-[#2c84c4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-600 bg-white leading-relaxed border-t border-gray-100">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">{t("cta.title")}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t("cta.description")}</p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-[#2c84c4] text-white rounded-lg font-bold hover:bg-[#2371a8] transition-colors shadow-lg"
          >
            {t("cta.button")}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
