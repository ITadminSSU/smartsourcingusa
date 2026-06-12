"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type Feature = { title: string; description: string };
type Benefit = { title: string; description: string };

type ServiceNamespace =
  | "services.operationsAdmin"
  | "services.customerSupport"
  | "services.backOfficeFinance"
  | "services.constructionField";

export default function ServicePageLayout({ namespace }: { namespace: ServiceNamespace }) {
  const t = useTranslations(namespace);
  const tc = useTranslations("common");

  const features = t.raw("features") as Feature[];
  const benefits = t.raw("benefits.items") as Benefit[];
  const sidebarFeatures = t.raw("sidebarFeatures") as string[];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-lg mb-6 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1 w-8 h-8 sm:w-10 sm:h-10">
                <div className="bg-white rounded" />
                <div className="bg-white/50 rounded" />
                <div className="bg-white/50 rounded" />
                <div className="bg-white rounded" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">{t("hero.title")}</h1>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-8 sm:gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{t("intro.title")}</h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">{t("intro.p1")}</p>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">{t("intro.p2")}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-[#2c84c4] rounded-lg p-8 sm:p-10 text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t("benefits.title")}</h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-2xl mt-1">✓</span>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                        <p className="text-white/90">{benefit.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{tc("keyFeatures")}</h3>
                <ul className="space-y-3 mb-6">
                  {sidebarFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-[#2c84c4] mt-1">✓</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="block w-full px-6 py-3 bg-[#2c84c4] text-white rounded-md font-semibold hover:bg-[#2371a8] transition-colors text-center"
                >
                  {tc("getStarted")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">{t("cta.title")}</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">{t("cta.description")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#2c84c4] text-white rounded-md font-semibold hover:bg-[#2371a8] transition-colors text-sm sm:text-base"
            >
              {tc("scheduleStrategyCall")}
            </Link>
            <Link
              href="/#services"
              className="px-8 py-3 bg-white border-2 border-[#2c84c4] text-[#2c84c4] rounded-md font-semibold hover:bg-[#2c84c4] hover:text-white transition-colors text-sm sm:text-base"
            >
              {tc("viewAllServices")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
