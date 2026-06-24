"use client";

import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type PrivacySection = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");
  const sections = t.raw("sections") as PrivacySection[];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">{t("title")}</h1>
        <div className="prose prose-blue max-w-none text-gray-600">
          <p className="mb-4">{t("lastUpdated")}</p>
          <p className="mb-4">{t("intro")}</p>
          {sections.map((section, index) => (
            <div key={index}>
              <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">{section.title}</h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  {section.list.map((item, lIndex) => (
                    <li key={lIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
