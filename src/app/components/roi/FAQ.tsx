"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type FaqItem = { question: string; answer: string };

export default function FAQ() {
  const t = useTranslations("roi.faq");
  const faqs = t.raw("items") as FaqItem[];
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);

  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <section className="roi-section">
      <div className="roi-container">
        <h2 className="roi-heading">{t("heading")}</h2>

        <div className="roi-flex-col">
          {faqs.map((faq, idx) => (
            <div key={idx} className="roi-card" style={{ overflow: "hidden" }}>
              <button onClick={() => toggleFAQ(idx)} className="roi-faq-btn">
                <span>{faq.question}</span>
                <span
                  style={{
                    fontSize: "1.25rem",
                    transition: "transform 0.3s ease",
                    transform: openFAQs.includes(idx) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>
              {openFAQs.includes(idx) && <div className="roi-answer-text">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
