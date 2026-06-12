"use client";

import { useTranslations } from "next-intl";

type Step = { title: string; content: string };
type TimelineItem = { marker: string; phase: string; description: string };

export default function HowItWorks() {
  const t = useTranslations("roi.howItWorks");
  const steps = t.raw("steps") as Step[];
  const timeline = t.raw("timeline.items") as TimelineItem[];

  return (
    <section className="roi-section">
      <div className="roi-container">
        <h2 className="roi-heading">{t("heading")}</h2>
        <div className="roi-grid-auto roi-mb-4">
          {steps.map((step, index) => (
            <div key={index} className="roi-card-top-border">
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  backgroundColor: "#2c84c4",
                  color: "#ffffff",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                {index + 1}
              </div>
              <div style={{ paddingRight: "80px" }}>
                <h3 className="roi-text-dark roi-mb-2 roi-text-xl roi-font-bold" style={{ lineHeight: "1.375" }}>
                  {step.title}
                </h3>
                <p className="roi-text-gray roi-text-sm roi-line-height-relaxed">{step.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="roi-bg-gray" style={{ padding: "40px", borderRadius: "8px", marginTop: "40px" }}>
          <h3 className="roi-text-dark roi-mb-3" style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {t("timeline.heading")}
          </h3>
          {timeline.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                marginBottom: idx === timeline.length - 1 ? "0" : "16px",
                paddingBottom: "16px",
                borderBottom: idx < timeline.length - 1 ? "1px solid #d1d5db" : "none",
              }}
            >
              <div className="roi-font-bold roi-text-blue-alt" style={{ minWidth: "100px" }}>
                {item.marker}
              </div>
              <div style={{ flex: 1, paddingLeft: "20px" }}>
                <strong>{item.phase}</strong> {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
