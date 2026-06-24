"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const LOGOS: { file: string; alt: string }[] = [
  { file: "Bluebeam.png", alt: "Bluebeam" },
  { file: "Planswift.png", alt: "PlanSwift" },
  { file: "Revit.png", alt: "Revit" },
  { file: "Autocad.png", alt: "AutoCAD" },
  { file: "Procore.png", alt: "Procore" },
  { file: "Construct Connect.png", alt: "ConstructConnect" },
  { file: "SketchUp.png", alt: "SketchUp" },
  { file: "B2W.png", alt: "B2W" },
  { file: "ZZ Takeoff.png", alt: "ZZ Takeoff" },
];

function LogoItem({ file, alt }: { file: string; alt: string }) {
  return (
    <div className="flex items-center justify-center shrink-0 px-8 sm:px-12">
      <Image
        src={`/Sofwares/${encodeURIComponent(file)}`}
        alt={alt}
        width={180}
        height={56}
        className="h-10 sm:h-12 w-auto object-contain opacity-80 transition-opacity hover:opacity-100"
      />
    </div>
  );
}

export default function SoftwareMarquee() {
  const t = useTranslations("home");

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
          {t("software.title")}
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          {t("software.subtitle")}
        </p>
      </div>

      <div className="ss-marquee relative overflow-hidden">
        {/* Soft fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div className="ss-marquee-track flex items-center">
          {/* Two identical sets for a seamless loop */}
          {LOGOS.map((logo, i) => (
            <LogoItem key={`a-${i}`} {...logo} />
          ))}
          {LOGOS.map((logo, i) => (
            <LogoItem key={`b-${i}`} {...logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
