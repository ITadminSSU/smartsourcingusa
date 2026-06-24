"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-8 sm:gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Smart Sourcing USA</h3>
            <p className="text-sm leading-relaxed mb-3 max-w-md">{t("tagline")}</p>
            <p className="text-sm text-gray-400 italic mb-6">{t("motto")}</p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/smartsourcingusa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src="/linkedin.png" alt="LinkedIn" width={32} height={32} className="w-full h-full object-contain" />
              </a>
              <a
                href="https://www.facebook.com/share/18opWCAsMm/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src="/facebook.png" alt="Facebook" width={32} height={32} className="w-full h-full object-contain" />
              </a>
              <a
                href="https://www.instagram.com/smartsourcingusa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src="/iglogo1.png" alt="Instagram" width={32} height={32} className="w-full h-full object-contain" />
              </a>
              <a
                href="https://www.tiktok.com/@smartsourcingusa?_r=1&_t=ZS-97LU5272CZB"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Image src="/tiktok.png" alt="TikTok" width={32} height={32} className="w-full h-full object-contain" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded opacity-60 cursor-not-allowed"
              >
                <Image src="/youtube.png" alt="YouTube" width={32} height={32} className="w-full h-full object-contain" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about-us" className="hover:text-white transition-colors">{t("whoWeAre")}</Link></li>
              <li><Link href="/#services" className="hover:text-white transition-colors">{t("servicesLink")}</Link></li>
              <li><Link href="/#process" className="hover:text-white transition-colors">{t("howItWorks")}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("contactUs")}</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">{t("careers")}</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">{t("faq")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("servicesTitle")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/operations-admin" className="hover:text-white transition-colors">{t("operationsAdmin")}</Link></li>
              <li><Link href="/services/customer-support" className="hover:text-white transition-colors">{t("customerSupport")}</Link></li>
              <li><Link href="/services/back-office-finance" className="hover:text-white transition-colors">{t("backOffice")}</Link></li>
              <li><Link href="/services/construction-field" className="hover:text-white transition-colors">{t("construction")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">{t("learnMore")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">{t("guide")}</Link></li>
              <li><Link href="/case-studies" className="hover:text-white transition-colors">{t("caseStudies")}</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">{t("blog")}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">{t("privacy")}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">{t("terms")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-xs">{t("copyright")}</div>
      </div>
    </footer>
  );
}
