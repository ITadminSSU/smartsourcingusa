"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type ValueItem = { title: string; description: string };

export default function AboutUsPage() {
  const t = useTranslations("about");
  const values = t.raw("values.items") as ValueItem[];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <br />
              {t("hero.titleLine2")}{" "}
              <span className="text-white/80">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">{t("mission.label")}</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">{t("mission.title")}</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>{t("mission.p1")}</p>
                <p>{t("mission.p2")}</p>
                <p>
                  {t("mission.p3")} <strong>{t("mission.p3Bold")}</strong>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src="/portrait-business-people-worker-team-outside.jpg"
                  alt={t("mission.imageAlt")}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#2c84c4]/10 rounded-full z-0" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#2c84c4]/5 rounded-full z-0" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("presence.title")}</h2>
            <p className="text-lg text-gray-600">{t("presence.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🇺🇸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("presence.usa.title")}</h3>
              <p className="text-gray-600">{t("presence.usa.description")}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🇲🇽</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("presence.mexico.title")}</h3>
              <p className="text-gray-600">{t("presence.mexico.description")}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🇵🇭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("presence.philippines.title")}</h3>
              <p className="text-gray-600">{t("presence.philippines.description")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t("values.title")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("values.subtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#2c84c4]">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#2c84c4] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t("cta.title")}</h2>
          <p className="text-xl mb-8 text-white/90">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-white text-[#2c84c4] rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t("cta.schedule")}
            </Link>
            <Link
              href="/case-studies"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              {t("cta.stories")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
