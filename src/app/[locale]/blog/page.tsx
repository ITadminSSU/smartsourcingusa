"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type BlogPost = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
};

export default function BlogPage() {
  const t = useTranslations("blog");
  const tc = useTranslations("common");
  const posts = t.raw("posts") as BlogPost[];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="h-20 sm:h-24 md:h-28" />

      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#2c84c4] to-[#2371a8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t("hero.title")} <span className="text-white/80">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 leading-relaxed max-w-3xl">{t("hero.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={index}
                className="flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-48 bg-gray-100 w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium bg-gray-200">
                    {tc("articleImage")}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="text-[#2c84c4] font-semibold uppercase tracking-wide">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#2c84c4] transition-colors">
                    <Link href="#">{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">{post.date}</span>
                    <Link href="#" className="text-sm font-semibold text-[#2c84c4] hover:text-[#2371a8] transition-colors">
                      {tc("readMore")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled>
              {tc("previous")}
            </button>
            <button className="px-4 py-2 bg-[#2c84c4] text-white rounded hover:bg-[#2371a8]">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-600">{tc("next")}</button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t("newsletter.title")}</h2>
          <p className="text-gray-600 mb-8">{t("newsletter.description")}</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={tc("emailPlaceholder")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
            />
            <button type="submit" className="px-6 py-3 bg-[#2c84c4] text-white font-bold rounded-md hover:bg-[#2371a8] transition-colors">
              {tc("subscribe")}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
