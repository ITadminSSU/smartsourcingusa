"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

type ProcessStep = { title: string; description: string };
type ProcessPhase = { stepRange: string; title: string; stepsLabel: string; description: string; tags: string[] };
type CriteriaCard = { title: string; description: string };
type PlacementKey = "asphalt" | "gc" | "arch" | "cladding" | "pm";

export default function HowItWorksPage() {
    const t = useTranslations("howItWorks");
    const placementTrackerRef = useRef<HTMLDivElement>(null);
    const roadmapRef = useRef<HTMLDivElement>(null);

    const traditionalSteps = t.raw("traditionalProcess.steps") as ProcessStep[];
    const phases = t.raw("process28.phases") as ProcessPhase[];
    const criteriaCards = t.raw("criteria.cards") as CriteriaCard[];
    const comparisonRows = t.raw("comparisonTable.rows") as string[];
    const comparisonStats = t.raw("comparisonTable.stats") as { value: string; label: string }[];

    const placements = useMemo(
        () => ({
            asphalt: { startDate: "2023-07-15", label: t("placementTracker.placements.asphalt") },
            gc: { startDate: "2024-10-15", label: t("placementTracker.placements.gc") },
            arch: { startDate: "2024-10-15", label: t("placementTracker.placements.arch") },
            cladding: { startDate: "2024-03-15", label: t("placementTracker.placements.cladding") },
            pm: { startDate: "2025-04-01", label: t("placementTracker.placements.pm") },
        }),
        [t]
    );

    const placementList: { key: PlacementKey; startDate: string }[] = [
        { key: "asphalt", startDate: "2023-07-15" },
        { key: "cladding", startDate: "2024-03-15" },
        { key: "gc", startDate: "2024-10-15" },
        { key: "arch", startDate: "2024-10-15" },
        { key: "pm", startDate: "2025-04-01" },
    ];

    useEffect(() => {

        function calculateMonths(startDateStr: string): number {
            const startDate = new Date(startDateStr);
            const currentDate = new Date('2026-01-30');

            const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
            const monthDiff = currentDate.getMonth() - startDate.getMonth();

            return yearDiff * 12 + monthDiff;
        }

        function createTicks(containerId: string, months: number) {
            const container = document.getElementById(containerId);
            if (!container) return;

            container.innerHTML = '';

            for (let i = 0; i < months; i++) {
                const tick = document.createElement('div');
                tick.className = 'tick';
                tick.style.animationDelay = `${i * 0.05}s`;
                container.appendChild(tick);
            }
        }

        function animateProgress(progressId: string, months: number) {
            const maxMonths = 31;
            const percentage = Math.min((months / maxMonths) * 100, 100);

            setTimeout(() => {
                const progressElement = document.getElementById(progressId);
                if (progressElement) {
                    progressElement.style.width = `${percentage}%`;
                }
            }, 100);
        }

        function updatePlacementDisplay(key: string, data: { startDate: string; label: string }) {
            const months = calculateMonths(data.startDate);

            const durationElement = document.getElementById(`duration-${key}`);
            if (durationElement) {
                durationElement.textContent = t("placementTracker.monthsTemplate", { count: months });
            }

            createTicks(`ticks-${key}`, months);
            animateProgress(`progress-${key}`, months);
        }

        // Initialize on page load
        const initializePlacements = () => {
            Object.keys(placements).forEach(key => {
                updatePlacementDisplay(key, placements[key as keyof typeof placements]);
            });
        };

        // Trigger animations when section comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Object.keys(placements).forEach(key => {
                        updatePlacementDisplay(key, placements[key as keyof typeof placements]);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        if (placementTrackerRef.current) {
            observer.observe(placementTrackerRef.current);
        }

        initializePlacements();

        return () => {
            observer.disconnect();
        };
    }, [placements, t]);

    // Roadmap animation observer
    useEffect(() => {
        const roadmapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const animatedElements = entry.target.querySelectorAll('.animate-fade-in-up');
                    animatedElements.forEach((el, index) => {
                        setTimeout(() => {
                            el.classList.add('animate');
                        }, index * 150);
                    });
                    roadmapObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        if (roadmapRef.current) {
            roadmapObserver.observe(roadmapRef.current);
        }

        return () => {
            roadmapObserver.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <div className="h-20 sm:h-24 md:h-28"></div>

            {/* Hero Section */}
            <section className="py-16 sm:py-20 md:py-24 bg-[#2c84c4] bg-gradient-to-br from-[#2c84c4] via-[#2371a8] to-[#1a5d8a] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight text-white">
                            {t("hero.titleBefore")} <span className="text-white">{t("hero.titleHighlight")}</span> {t("hero.titleAfter")}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 font-light max-w-3xl mx-auto">
                            {t("hero.subtitle")}
                        </p>
                    </div>
                </div>
            </section>

            {/* Comparison Banner */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
                        <div className="bg-red-50 rounded-lg p-6 sm:p-8 md:p-10 border-2 border-red-500 text-center">
                            <div className="text-4xl sm:text-5xl mb-4">📞</div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">{t("comparisonBanner.traditional.title")}</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                <strong>{t("comparisonBanner.traditional.modelLabel")}</strong> {t("comparisonBanner.traditional.description")}
                            </p>
                        </div>
                        <div className="bg-[#2c84c4]/10 rounded-lg p-6 sm:p-8 md:p-10 border-2 border-[#2c84c4] text-center">
                            <div className="text-4xl sm:text-5xl mb-4">🎯</div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-[#2c84c4] mb-4">{t("comparisonBanner.smartsourcing.title")}</h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                <strong>{t("comparisonBanner.smartsourcing.modelLabel")}</strong> {t("comparisonBanner.smartsourcing.description")}
                            </p>
                        </div>
                    </div>

                    {/* Traditional Process */}
                    <div className="bg-red-50 rounded-lg p-6 sm:p-8 md:p-10 border-2 border-red-500 mb-12 sm:mb-16">
                        <h3 className="text-2xl sm:text-3xl font-bold text-red-600 mb-6 sm:mb-8 text-center">{t("traditionalProcess.title")}</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {traditionalSteps.map((step, index) => (
                                <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border-l-3 border-red-500">
                                    <h5 className="text-lg font-bold text-red-600 mb-2">{step.title}</h5>
                                    <p className="text-sm text-gray-600">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 28-Step Process */}
            <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">{t("process28.title")}</h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-2">{t("process28.subtitle")}</p>
                        <p className="text-base sm:text-lg text-gray-500 italic">{t("process28.tagline")}</p>
                    </div>

                    {/* Roadmap Container */}
                    <div ref={roadmapRef} className="relative bg-white rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 overflow-hidden">
                        {/* SVG Road Path - Desktop (curved horizontal) */}
                        <svg
                            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 hidden lg:block"
                            viewBox="0 0 1200 2000"
                            preserveAspectRatio="xMidYMin meet"
                            style={{ minHeight: '100%' }}
                        >
                            <defs>
                                <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#475569', stopOpacity: 0.8 }} />
                                    <stop offset="50%" style={{ stopColor: '#64748b', stopOpacity: 0.9 }} />
                                    <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 0.8 }} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 100,80 Q 300,100 450,200 T 900,350 Q 1100,450 1000,600 Q 800,750 600,700 T 200,850 Q 100,950 150,1100 T 400,1300 Q 500,1500 600,1700 T 400,1900"
                                stroke="url(#roadGradient)"
                                strokeWidth="70"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 100,80 Q 300,100 450,200 T 900,350 Q 1100,450 1000,600 Q 800,750 600,700 T 200,850 Q 100,950 150,1100 T 400,1300 Q 500,1500 600,1700 T 400,1900"
                                stroke="#fbbf24"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="20,15"
                                opacity="0.9"
                            />
                        </svg>

                        {/* SVG Road Path - Tablet & Mobile (wavy vertical) */}
                        <svg
                            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 block lg:hidden"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            style={{ width: '100%', height: '100%' }}
                        >
                            <defs>
                                <linearGradient id="roadGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#475569', stopOpacity: 0.8 }} />
                                    <stop offset="50%" style={{ stopColor: '#64748b', stopOpacity: 0.9 }} />
                                    <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 0.8 }} />
                                </linearGradient>
                            </defs>

                            {/* Wavy Road Path - Tablet */}
                            <path
                                d="M 50,0 Q 45,5 50,10 Q 55,15 50,20 Q 45,25 50,30 Q 55,35 50,40 Q 45,45 50,50 Q 55,55 50,60 Q 45,65 50,70 Q 55,75 50,80 Q 45,85 50,90 Q 55,95 50,100"
                                stroke="#475569"
                                strokeWidth="6"
                                fill="none"
                                strokeLinecap="round"
                                opacity="0.8"
                                className="hidden md:block"
                            />
                            <path
                                d="M 50,0 Q 45,5 50,10 Q 55,15 50,20 Q 45,25 50,30 Q 55,35 50,40 Q 45,45 50,50 Q 55,55 50,60 Q 45,65 50,70 Q 55,75 50,80 Q 45,85 50,90 Q 55,95 50,100"
                                stroke="#fbbf24"
                                strokeWidth="0.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="1.5,1"
                                opacity="0.9"
                                className="hidden md:block"
                            />

                            {/* Wavy Road Path - Mobile */}
                            <path
                                d="M 50,0 Q 45,5 50,10 Q 55,15 50,20 Q 45,25 50,30 Q 55,35 50,40 Q 45,45 50,50 Q 55,55 50,60 Q 45,65 50,70 Q 55,75 50,80 Q 45,85 50,90 Q 55,95 50,100"
                                stroke="#475569"
                                strokeWidth="5"
                                fill="none"
                                strokeLinecap="round"
                                opacity="0.8"
                                className="block md:hidden"
                            />
                            <path
                                d="M 50,0 Q 45,5 50,10 Q 55,15 50,20 Q 45,25 50,30 Q 55,35 50,40 Q 45,45 50,50 Q 55,55 50,60 Q 45,65 50,70 Q 55,75 50,80 Q 45,85 50,90 Q 55,95 50,100"
                                stroke="#fbbf24"
                                strokeWidth="0.4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="1.2,0.8"
                                opacity="0.9"
                                className="block md:hidden"
                            />
                        </svg>

                        {/* Roadmap Steps */}
                        <div className="relative z-10 space-y-8 sm:space-y-10 md:space-y-12">
                            {phases.map((phase, index) => {
                                const isReversed = index % 2 === 1;
                                const tagStyles = [
                                    "bg-yellow-100 text-yellow-700",
                                    "bg-[#2c84c4]/10 text-[#2c84c4]",
                                    "bg-green-100 text-green-700",
                                ];
                                const card = (
                                    <div
                                        className="bg-white rounded-xl p-6 sm:p-8 border-l-4 border-[#2c84c4] flex-1 shadow-lg border border-gray-200 animate-fade-in-up"
                                        style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                                    >
                                        <h4 className="text-xl sm:text-2xl font-bold text-[#2c84c4] mb-3 sm:mb-4">{phase.title}</h4>
                                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                                            <strong>{phase.stepsLabel}</strong> {phase.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {phase.tags.map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${tagStyles[tagIndex % tagStyles.length]}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                                const circle = (
                                    <div
                                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#2c84c4] rounded-full flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold flex-shrink-0 shadow-lg shadow-[#2c84c4]/50 relative z-20 animate-fade-in-up"
                                        style={{ animationDelay: `${(index + 1) * 0.1 + (isReversed ? 0.1 : 0)}s` }}
                                    >
                                        <span className="text-xs sm:text-sm md:text-base">{phase.stepRange}</span>
                                    </div>
                                );
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col md:flex-row gap-6 md:gap-8 items-start ${isReversed ? "md:justify-end" : ""}`}
                                    >
                                        {isReversed ? (
                                            <>
                                                <div className="order-2 md:order-1 flex-1">{card}</div>
                                                <div className="order-1 md:order-2">{circle}</div>
                                            </>
                                        ) : (
                                            <>
                                                {circle}
                                                {card}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Criteria Assessment Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="bg-[#2c84c4]/10 rounded-lg p-8 sm:p-10 md:p-12 border-2 border-[#2c84c4]">
                        <h3 className="text-3xl sm:text-4xl font-bold text-[#2c84c4] mb-6 sm:mb-8 text-center">{t("criteria.title")}</h3>
                        <p className="text-center text-gray-700 mb-8 sm:mb-10 text-lg max-w-3xl mx-auto">{t("criteria.intro")}</p>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {criteriaCards.map((card, index) => (
                                <div key={index} className="bg-white rounded-lg p-6 border-l-3 border-[#2c84c4]">
                                    <h5 className="text-lg sm:text-xl font-bold text-[#2c84c4] mb-3">{card.title}</h5>
                                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{card.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="bg-white rounded-lg p-8 sm:p-10 md:p-12">
                        <div className="text-center mb-8 sm:mb-10">
                            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">{t("comparisonTable.title")}</h3>
                            <p className="text-lg text-gray-600">{t("comparisonTable.subtitle")}</p>
                        </div>

                        <div className="overflow-x-auto w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                            <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ minWidth: '700px' }}>
                                <div className="grid grid-cols-3 border-b border-gray-200 bg-[#2c84c4]">
                                    <div className="p-3 sm:p-4 md:p-6 text-center font-bold text-white text-xs sm:text-sm md:text-base border-r border-white/20">{t("comparisonTable.headers.processElement")}</div>
                                    <div className="p-3 sm:p-4 md:p-6 text-center font-bold text-white text-xs sm:text-sm md:text-base border-r border-white/20 whitespace-nowrap">{t("comparisonTable.headers.smartsourcing")}</div>
                                    <div className="p-3 sm:p-4 md:p-6 text-center font-bold text-white text-xs sm:text-sm md:text-base whitespace-nowrap">{t("comparisonTable.headers.traditional")}</div>
                                </div>

                                {comparisonRows.map((element, idx) => (
                                    <div key={idx} className={`grid grid-cols-3 ${idx < comparisonRows.length - 1 ? "border-b border-gray-200" : ""}`}>
                                        <div className="p-3 sm:p-4 md:p-6 text-xs sm:text-sm md:text-base text-gray-700 border-r border-gray-200 break-words hyphens-auto">
                                            {element}
                                        </div>
                                        <div className="p-3 sm:p-4 md:p-6 text-sm sm:text-base text-[#2c84c4] bg-[#2c84c4]/10 border-r border-gray-200 text-center flex items-center justify-center">
                                            <span className="text-green-600 font-bold text-lg sm:text-xl">✓</span>
                                        </div>
                                        <div className="p-3 sm:p-4 md:p-6 text-sm sm:text-base text-gray-700 text-center flex items-center justify-center">
                                            <span className="text-red-600 font-bold text-lg sm:text-xl">✗</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mt-10 sm:mt-12">
                            {comparisonStats.map((stat, index) => (
                                <div
                                    key={index}
                                    className={`bg-white rounded-lg p-4 sm:p-6 text-center border border-gray-200 shadow-sm ${index === comparisonStats.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
                                >
                                    <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2c84c4] mb-2">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 break-words">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Placement Tracker Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-10 sm:mb-12">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">{t("placementTracker.title")}</h2>
                        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">{t("placementTracker.subtitle")}</p>
                    </div>

                    <div ref={placementTrackerRef} className="space-y-8 sm:space-y-12">
                        {placementList.map((placement) => (
                            <div key={placement.key} className="mb-8 sm:mb-12">
                                <div className="flex justify-between items-center mb-3 sm:mb-4">
                                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900">{placements[placement.key].label}</h4>
                                    <p className="text-lg sm:text-xl font-semibold text-[#2c84c4]" id={`duration-${placement.key}`}>
                                        {t("placementTracker.loading")}
                                    </p>
                                </div>
                                <div className="relative">
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            id={`progress-${placement.key}`}
                                            className="h-full bg-gradient-to-r from-red-500 to-[#2c84c4] rounded-full transition-all duration-2000"
                                            style={{ width: '0%' }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between mt-2" id={`ticks-${placement.key}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10 sm:mt-12">
                        <p className="text-base sm:text-lg text-gray-600">
                            {t("placementTracker.footer")} <strong className="text-[#2c84c4]">{t("placementTracker.footerRetention")}</strong>
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 md:py-20 bg-[#2c84c4] text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">{t("cta.title")}</h2>
                    <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto">{t("cta.description")}</p>
                    <Link
                        href="/contact"
                        className="inline-block px-8 py-3 sm:py-4 bg-white text-[#2c84c4] rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
                    >
                        {t("cta.button")}
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

