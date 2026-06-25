"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";

export default function CalendlyEmbed() {
  const t = useTranslations("contact.schedule");
  const locale = useLocale();

  useEffect(() => {
    if (!CALENDLY_URL) return;

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://assets.calendly.com/assets/external/widget.js"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (!CALENDLY_URL) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-6 text-sm text-amber-900">
        {t("bookingUnavailable")}{" "}
        <a
          href="mailto:sales@smartsourcingusa.com"
          className="font-semibold underline hover:no-underline"
        >
          sales@smartsourcingusa.com
        </a>
      </div>
    );
  }

  const separator = CALENDLY_URL.includes("?") ? "&" : "?";
  const url = `${CALENDLY_URL}${separator}hide_gdpr_banner=1&locale=${locale}`;

  return (
    <div
      className="calendly-inline-widget w-full"
      data-url={url}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}
