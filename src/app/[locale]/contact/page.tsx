"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ClientInquiryForm from "@/app/components/contact/ClientInquiryForm";
import RequestCallForm from "@/app/components/contact/RequestCallForm";

type ContactTab = "inquiry" | "schedule";

export default function ContactPage() {
  const t = useTranslations("contact");
  const whyCallItems = t.raw("whyCall.items") as string[];
  const [activeTab, setActiveTab] = useState<ContactTab>("inquiry");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash === "schedule" || hash === "inquiry") {
      setActiveTab(hash);
    } else if (hash === "contact-section") {
      setActiveTab("inquiry");
    }

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "schedule" || tab === "inquiry") {
      setActiveTab(tab);
    }
  }, []);

  const switchTab = (tab: ContactTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">{t("hero.title")}</h1>
            <p className="text-lg sm:text-xl text-white/95 mb-2">{t("hero.subtitle")}</p>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed">{t("hero.description")}</p>
          </div>
        </div>
      </section>

      <section id="contact-section" className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 w-full">
            <div className="lg:col-span-1 space-y-8 min-w-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{t("getInTouch.title")}</h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">{t("getInTouch.description")}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#2c84c4] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{t("getInTouch.emailLabel")}</h3>
                    <a
                      href="mailto:sales@smartsourcingusa.com"
                      className="text-[#2c84c4] hover:text-[#2371a8] transition-colors break-words"
                    >
                      sales@smartsourcingusa.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">{t("whyCall.title")}</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {whyCallItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#2c84c4] mt-1 flex-shrink-0">✓</span>
                      <span className="break-words">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2 min-w-0">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full overflow-hidden">
                <div className="flex border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => switchTab("inquiry")}
                    className={`flex-1 px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold transition-colors border-b-2 ${
                      activeTab === "inquiry"
                        ? "border-[#2c84c4] text-[#2c84c4] bg-[#2c84c4]/5"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {t("tabs.inquiry")}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab("schedule")}
                    className={`flex-1 px-4 sm:px-6 py-4 text-sm sm:text-base font-semibold transition-colors border-b-2 ${
                      activeTab === "schedule"
                        ? "border-[#2c84c4] text-[#2c84c4] bg-[#2c84c4]/5"
                        : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {t("tabs.schedule")}
                  </button>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  {activeTab === "inquiry" ? (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t("inquiry.title")}</h2>
                        <p className="text-base sm:text-lg text-gray-600">{t("inquiry.description")}</p>
                      </div>
                      <ClientInquiryForm />
                      <p className="mt-6 text-sm text-gray-500 text-center sm:text-left">
                        {t("inquiry.scheduleHint")}{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("schedule")}
                          className="text-[#2c84c4] font-semibold hover:text-[#2371a8] transition-colors"
                        >
                          {t("inquiry.scheduleLink")}
                        </button>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t("schedule.title")}</h2>
                        <p className="text-base sm:text-lg text-gray-600">{t("schedule.description")}</p>
                      </div>
                      <RequestCallForm />
                      <p className="mt-6 text-sm text-gray-500 text-center sm:text-left">
                        {t("schedule.inquiryHint")}{" "}
                        <button
                          type="button"
                          onClick={() => switchTab("inquiry")}
                          className="text-[#2c84c4] font-semibold hover:text-[#2371a8] transition-colors"
                        >
                          {t("schedule.inquiryLink")}
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{t("bottomCta.title")}</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">{t("bottomCta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => {
                switchTab("inquiry");
                document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 sm:px-8 py-3 bg-[#2c84c4] text-white rounded-md font-semibold hover:bg-[#2371a8] transition-colors text-sm sm:text-base"
            >
              {t("bottomCta.inquiry")}
            </button>
            <Link
              href="/about-us"
              className="px-6 sm:px-8 py-3 bg-white border-2 border-[#2c84c4] text-[#2c84c4] rounded-md font-semibold hover:bg-[#2c84c4] hover:text-white transition-colors text-sm sm:text-base inline-block"
            >
              {t("bottomCta.learnMore")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
