"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { EXECUTIVE_TEAM, type TeamMemberBase } from "@/data/teamMembers";

type TeamCardProps = {
  member: TeamMemberBase;
  title: string;
  photoLabel: string;
};

function TeamCard({ member, title, photoLabel }: TeamCardProps) {

  return (
    <article className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#2c84c4]/30 flex flex-col">
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#2c84c4] to-[#2371a8] aspect-[4/3]">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="font-bold tracking-wide text-4xl sm:text-5xl">
              {member.initials}
            </span>
            <span className="mt-3 text-xs sm:text-sm text-white/80 uppercase tracking-wider">
              {photoLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 mb-2 text-lg sm:text-xl">
          {member.name}
        </h3>
        <p className="text-[#2c84c4] font-semibold leading-snug text-sm">
          {title}
        </p>
      </div>
    </article>
  );
}

export default function OurTeamPage() {
  const t = useTranslations("ourTeam");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-16 sm:py-20 md:py-24 bg-[#2c84c4] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 leading-tight text-white">
              {t("hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-white/95 leading-relaxed">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t("sections.executive.title")}
            </h2>
            <p className="text-lg text-gray-600">{t("sections.executive.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {EXECUTIVE_TEAM.map((member) => (
              <TeamCard
                key={member.key}
                member={member}
                title={t(`members.${member.key}.title`)}
                photoLabel={t("card.photoComingSoon")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 bg-[#2c84c4] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight text-white">
              {t("cta.title")}
            </h2>
            <p className="text-lg sm:text-xl text-white font-medium mb-3 sm:mb-4">{t("cta.tagline")}</p>
            <p className="text-base sm:text-lg text-white/90 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto">
              {t("cta.description")}
            </p>
            <Link
              href="/contact"
              className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#2c84c4] rounded-md font-semibold hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto shadow-lg hover:shadow-xl"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
