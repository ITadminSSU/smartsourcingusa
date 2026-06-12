"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  const switchLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  };

  const buttonClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 min-w-[2.5rem] transition-colors ${
      active
        ? "bg-[#2c84c4] text-white shadow-sm"
        : "text-gray-600 hover:text-[#2c84c4] hover:bg-white"
    }`;

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 text-xs font-semibold shrink-0"
      role="group"
      aria-label={t("toggleLabel")}
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        className={buttonClass(locale === "en")}
      >
        {t("english")}
      </button>
      <button
        type="button"
        onClick={() => switchLocale("es")}
        aria-pressed={locale === "es"}
        className={buttonClass(locale === "es")}
      >
        {t("spanish")}
      </button>
    </div>
  );
}
