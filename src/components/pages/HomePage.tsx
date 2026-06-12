"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type BenefitItem = { title: string; description: string };
type ComparisonRow = { feature: string; us: string; traditional: string };
type ServiceItem = { title: string; description: string };
type ProcessStep = { title: string; description: string };

export default function HomePage() {
  const t = useTranslations("home");
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const benefits = t.raw("benefits") as BenefitItem[];
  const comparisonRows = t.raw("comparison.rows") as ComparisonRow[];
  const services = t.raw("services.items") as ServiceItem[];
  const processSteps = t.raw("process.steps") as ProcessStep[];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in-view");
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-16 sm:py-20 md:py-24 bg-[#2c84c4] bg-gradient-to-br from-[#2c84c4] via-[#2371a8] to-[#1a5d8a] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight text-white">
              {t("hero.title")}{" "}
              <span className="text-white">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white mb-4 sm:mb-6 font-light max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-8 sm:mb-10 italic max-w-2xl mx-auto">
              {t("hero.quote")}
            </p>
            <Link
              href="/roi"
              className="inline-block px-8 py-2.5 sm:py-3 sm:px-10 text-base sm:text-lg bg-white text-[#2c84c4] rounded-lg font-bold hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              {t("hero.cta")}
            </Link>
          </div>
        </div>
      </section>

      <section
        id="why-choose"
        ref={(el) => {
          sectionRefs.current[1] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-50 rounded-lg p-6 sm:p-8 md:p-10 mb-10 sm:mb-12 md:mb-16 text-center border-2 border-[#2c84c4]">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[#2c84c4]">
              {t("connectionBanner.title")}
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              {t("connectionBanner.description")}
            </p>
          </div>

          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              {t("whyChoose.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("whyChoose.subtitle")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 sm:p-8 border-l-4 border-[#2c84c4] border border-gray-200 hover:border-[#2c84c4] hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2c84c4] rounded-lg mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-5 h-5 sm:w-6 sm:h-6">
                    <div className="bg-white rounded" />
                    <div className="bg-white/50 rounded" />
                    <div className="bg-white/50 rounded" />
                    <div className="bg-white rounded" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#2c84c4] mb-3 sm:mb-4">
                  {benefit.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          sectionRefs.current[2] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg p-8 sm:p-10 md:p-12">
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                {t("comparison.title")}
              </h3>
              <p className="text-lg text-gray-600">{t("comparison.subtitle")}</p>
            </div>

            <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: "touch" }}>
              <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ minWidth: "700px" }}>
                <div className="grid grid-cols-3 border-b border-gray-200 bg-[#2c84c4]">
                  <div className="p-4 sm:p-6 text-center font-bold text-white text-sm sm:text-base border-r border-white/20 whitespace-nowrap" style={{ minWidth: "220px" }}>
                    {t("comparison.feature")}
                  </div>
                  <div className="p-4 sm:p-6 text-center font-bold text-white text-sm sm:text-base border-r border-white/20 whitespace-nowrap" style={{ minWidth: "200px" }}>
                    {t("comparison.us")}
                  </div>
                  <div className="p-4 sm:p-6 text-center font-bold text-white text-sm sm:text-base whitespace-nowrap" style={{ minWidth: "220px" }}>
                    {t("comparison.traditional")}
                  </div>
                </div>
                {comparisonRows.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-3 ${index < comparisonRows.length - 1 ? "border-b border-gray-200" : ""}`}
                  >
                    <div className="p-4 sm:p-6 text-sm sm:text-base text-gray-700 border-r border-gray-200 whitespace-nowrap" style={{ minWidth: "220px" }}>
                      {row.feature}
                    </div>
                    <div className="p-4 sm:p-6 text-sm sm:text-base text-[#2c84c4] bg-[#2c84c4]/10 border-r border-gray-200 text-center whitespace-nowrap" style={{ minWidth: "200px" }}>
                      <span className="text-green-600 font-bold text-xl">✓</span> {row.us}
                    </div>
                    <div className="p-4 sm:p-6 text-sm sm:text-base text-gray-700 text-center whitespace-nowrap" style={{ minWidth: "220px" }}>
                      <span className="text-red-600 font-bold text-xl">✗</span> {row.traditional}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          sectionRefs.current[3] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-gray-50"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg p-8 sm:p-10 md:p-12 text-center border border-gray-200">
            <p className="text-lg sm:text-xl md:text-2xl text-[#2c84c4] italic mb-6 sm:mb-8 leading-relaxed">
              {t("testimonial.quote")}
            </p>
            <p className="text-sm sm:text-base text-[#2c84c4]">{t("testimonial.attribution")}</p>
          </div>
        </div>
      </section>

      <section
        id="process"
        ref={(el) => {
          sectionRefs.current[8] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight px-2">
              {t("process.title")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-5xl mx-auto">
            {processSteps.map((step, index) => (
              <div
                key={step.title}
                className={`text-center ${index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2c84c4] rounded-lg mx-auto mb-4 sm:mb-6 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="services"
        ref={(el) => {
          sectionRefs.current[5] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 sm:mb-12 md:mb-16">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-3 sm:mb-4">
              {t("services.label")}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
              {t("services.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium mb-2">{t("services.subtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-lg p-6 sm:p-8 border-l-3 border-[#2c84c4] border border-gray-200 hover:border-[#2c84c4] transition-all"
              >
                <h4 className="text-lg sm:text-xl font-bold text-[#2c84c4] mb-3 sm:mb-4">{service.title}</h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={(el) => {
          sectionRefs.current[6] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
              {t("stats.title")}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">{t("stats.subtitle")}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center border border-gray-200 min-w-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2c84c4] mb-2 sm:mb-3 whitespace-nowrap">40-60%</div>
              <div className="text-sm sm:text-base text-gray-600">{t("stats.costReduction")}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center border border-gray-200 min-w-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2c84c4] mb-2 sm:mb-3">2</div>
              <div className="text-sm sm:text-base text-gray-600">{t("stats.offices")}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center border border-gray-200 min-w-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2c84c4] mb-2 sm:mb-3">10+</div>
              <div className="text-sm sm:text-base text-gray-600">{t("stats.experience")}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center border border-gray-200 min-w-0">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2c84c4] mb-2 sm:mb-3">100+</div>
              <div className="text-sm sm:text-base text-gray-600">{t("stats.placements")}</div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        ref={(el) => {
          sectionRefs.current[9] = el;
        }}
        className="scroll-section py-12 sm:py-16 md:py-20 bg-[#2c84c4] text-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">{t("cta.title")}</h2>
          <p className="text-base sm:text-lg text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/contact"
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#2c84c4] rounded-md font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
