"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Plan = {
  name: string;
  experience: string;
  period: string;
  billingInfo: string;
  cta: string;
  features: string[];
};

type SetupItem = { title: string; desc: string };
type PricingFaq = { q: string; a: string };

export default function Pricing() {
  const t = useTranslations("roi.pricing");
  const plans = t.raw("plans") as Plan[];
  const setupItems = t.raw("setup.items") as SetupItem[];
  const faqs = t.raw("faq.items") as PricingFaq[];

  return (
    <section className="roi-pricing-section">
      <div className="roi-pricing-container">
        <div className="text-center roi-mb-4" style={{ marginBottom: "56px" }}>
          <h2 className="roi-heading" style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
            {t("heading")}
          </h2>
          <p className="roi-subheading" style={{ maxWidth: "768px" }}>
            {t("subheading")}
          </p>
        </div>

        <div className="roi-grid-3" style={{ alignItems: "stretch", marginBottom: "64px" }}>
          {plans.map((plan, index) => {
            const featured = index === 1;
            return (
              <div
                key={plan.name}
                className={`roi-pricing-card ${featured ? "roi-pricing-card-featured" : "roi-pricing-card-normal"}`}
                style={{ paddingBottom: "60px" }}
              >
                {featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-15px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 20,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                        color: "white",
                        padding: "8px 40px",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        letterSpacing: "1px",
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ color: "#fbbf24" }}>★</span>
                      {t("mostPopular")}
                    </div>
                  </div>
                )}

                <h3 className="text-3xl font-extrabold text-slate-900 mb-3" style={{ fontWeight: "600" }}>
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500 italic mb-10">{plan.experience}</p>

                <div className="mb-2">
                  <div className="text-sm text-slate-500 mt-2">{plan.period}</div>
                  <div className="text-sm text-slate-400 pb-7 mb-8 border-b border-slate-200">{plan.billingInfo}</div>
                </div>

                <ul className="space-y-5 mb-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="text-emerald-500 font-bold leading-none mt-0.5 text-lg">✓</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/contact" className="roi-btn-primary-padded inline-block text-center">
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="roi-setup-section">
          <h3 className="roi-setup-heading">{t("setup.heading")}</h3>
          <p className="roi-setup-description">{t("setup.description")}</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {setupItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 hover:border-[#2c84c4] transition-all min-h-[280px] sm:min-h-[300px] flex flex-col"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#2c84c4] rounded-lg mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-5 h-5 sm:w-6 sm:h-6">
                    <div className="bg-white rounded" />
                    <div className="bg-white/50 rounded" />
                    <div className="bg-white/50 rounded" />
                    <div className="bg-white rounded" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-grow">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="roi-comparison-box">
            <p className="roi-comparison-text">
              <strong className="roi-comparison-strong">{t("setup.comparison.label")}</strong> {t("setup.comparison.text")}
              <strong className="roi-comparison-strong">{t("setup.comparison.savings")}</strong> with{" "}
              <strong className="roi-comparison-strong">{t("setup.comparison.bidCapacity")}</strong> and{" "}
              <strong className="roi-comparison-strong">{t("setup.comparison.predictable")}</strong>
            </p>
          </div>
        </div>

        <div className="roi-mt-8">
          <h3 className="roi-heading" style={{ fontSize: "2rem", marginBottom: "40px" }}>
            {t("faq.heading")}
          </h3>

          <div className="roi-flex-col" style={{ gap: "20px" }}>
            {faqs.map((item) => (
              <div key={item.q} className="roi-card" style={{ borderRadius: "12px", padding: "28px" }}>
                <div className="roi-text-dark roi-font-semibold roi-mb-1" style={{ fontSize: "1.05rem" }}>
                  {item.q}
                </div>
                <p className="roi-text-gray" style={{ lineHeight: "1.6", fontSize: "0.9rem" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
