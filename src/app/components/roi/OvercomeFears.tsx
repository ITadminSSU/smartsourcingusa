"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type FearItem = {
  icon: string;
  question: string;
  intro?: string;
  introBold?: string;
  paragraph?: string;
  bullets?: string[];
  timeBlocks?: { label: string; text: string }[];
  closingLabel: string;
  closing: string;
};

export default function OvercomeFears() {
  const t = useTranslations("roi.overcomeFears");
  const fears = t.raw("items") as FearItem[];
  const [openFears, setOpenFears] = useState<number[]>([]);

  const toggleFear = (index: number) => {
    setOpenFears((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <section className="roi-section">
      <div className="roi-container">
        <h2 className="roi-heading">{t("heading")}</h2>
        <p className="roi-text-gray roi-text-center roi-mb-4" style={{ maxWidth: "768px", margin: "0 auto 32px" }}>
          {t("subheading")}
        </p>

        <div className="roi-flex-col">
          {fears.map((fear, idx) => (
            <div key={idx} className="roi-card" style={{ overflow: "hidden" }}>
              <button onClick={() => toggleFear(idx)} className="roi-faq-btn">
                <span>
                  {fear.icon} {fear.question}
                </span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    transition: "transform 0.3s ease",
                    transform: openFears.includes(idx) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>
              {openFears.includes(idx) && (
                <div className="roi-answer-text">
                  <div className="roi-answer-header">{t("answerHeader")}</div>
                  {fear.introBold && (
                    <p>
                      <strong>{fear.introBold}</strong>
                    </p>
                  )}
                  {fear.intro && <p>{fear.intro}</p>}
                  {fear.paragraph && <p>{fear.paragraph}</p>}
                  {fear.bullets && fear.bullets.length > 0 && (
                    <ul style={{ marginTop: "8px", marginLeft: "20px", color: "#4b5563", listStyle: "disc" }}>
                      {fear.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {fear.timeBlocks && (
                    <ul style={{ marginTop: "8px", marginLeft: "20px", color: "#4b5563", listStyle: "disc" }}>
                      {fear.timeBlocks.map((block, i) => (
                        <li key={i}>
                          <strong>{block.label}</strong> {block.text}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p style={{ marginTop: "16px" }}>
                    <strong>{fear.closingLabel}</strong> {fear.closing}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
