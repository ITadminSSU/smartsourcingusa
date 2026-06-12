"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ROIData {
    salary: number;
    benefits: number;
    overhead: number;
    currentBids: number;
    projectValue: number;
    winRate: number;
}

interface ROIResults {
    currentCost: number;
    smartCost: number;
    savings: number;
    newBids: number;
    additionalRevenue: number;
    paybackDays: number;
}

export default function ROICalculator() {
    const t = useTranslations("roi.calculator");
    const [roiData, setRoiData] = useState<ROIData>({
        salary: 75000,
        benefits: 35,
        overhead: 10000,
        currentBids: 12,
        projectValue: 100000,
        winRate: 25,
    });
    const [roiResults, setRoiResults] = useState<ROIResults | null>(null);

    const calculateROI = () => {
        const { salary, benefits, overhead, currentBids, projectValue, winRate } = roiData;
        const benefitsRate = benefits / 100;
        const benefitsAmount = salary * benefitsRate;
        const currentCost = salary + benefitsAmount + overhead;
        const smartCost = 48000;
        const savings = currentCost - smartCost;
        const newBids = Math.round(currentBids * 2.5);
        const additionalWins = (newBids - currentBids) * (winRate / 100);
        const additionalRevenue = additionalWins * projectValue;
        const paybackDays = Math.round((3000 / (savings / 365)));

        setRoiResults({
            currentCost,
            smartCost,
            savings,
            newBids,
            additionalRevenue,
            paybackDays,
        });
    };

    useEffect(() => {
        calculateROI();
    }, [roiData]);

    return (
        <section className="roi-section">
            <div className="roi-container">
                <h2 className="roi-heading">{t("heading")}</h2>
                <div className="roi-bg-gray" style={{ padding: "40px", borderRadius: "8px", maxWidth: "768px", margin: "0 auto" }}>
                    <div className="roi-flex-col-lg roi-mb-3">
                        <div>
                            <label className="roi-label">{t("labels.salary")}</label>
                            <input
                                type="number"
                                value={roiData.salary}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, salary: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="75000"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="roi-label">{t("labels.benefits")}</label>
                            <input
                                type="number"
                                value={roiData.benefits}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, benefits: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="35"
                                min="0"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="roi-label">{t("labels.overhead")}</label>
                            <input
                                type="number"
                                value={roiData.overhead}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, overhead: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="10000"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="roi-label">{t("labels.currentBids")}</label>
                            <input
                                type="number"
                                value={roiData.currentBids}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, currentBids: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="12"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="roi-label">{t("labels.projectValue")}</label>
                            <input
                                type="number"
                                value={roiData.projectValue}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, projectValue: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="100000"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="roi-label">{t("labels.winRate")}</label>
                            <input
                                type="number"
                                value={roiData.winRate}
                                onChange={(e) =>
                                    setRoiData({ ...roiData, winRate: parseFloat(e.target.value) || 0 })
                                }
                                className="roi-input"
                                placeholder="25"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>

                    {roiResults && (
                        <div className="roi-card-blue-border roi-mt-4">
                            <h3 className="roi-text-dark roi-mb-2" style={{ fontSize: "1.25rem", fontWeight: "700" }}>
                                {t("results.title")}
                            </h3>

                            <div className="roi-flex-col">
                                <div className="roi-result-row roi-border-bottom">
                                    <span className="roi-font-semibold" style={{ color: "#1f2937" }}>
                                        {t("results.currentCost")}
                                    </span>
                                    <span className="roi-text-blue-alt roi-font-bold roi-text-lg">
                                        ${roiResults.currentCost.toLocaleString()}
                                    </span>
                                </div>

                                <div className="roi-result-row roi-border-bottom">
                                    <span className="roi-font-semibold" style={{ color: "#1f2937" }}>
                                        {t("results.smartCost")}
                                    </span>
                                    <span className="roi-text-blue-alt roi-font-bold roi-text-lg">
                                        ${roiResults.smartCost.toLocaleString()}
                                    </span>
                                </div>

                                <div className="roi-highlight-box roi-result-row">
                                    <span className="roi-highlight-text roi-font-semibold">{t("results.annualSavings")}</span>
                                    <span className="roi-highlight-text roi-font-bold roi-text-lg">
                                        ${Math.round(roiResults.savings).toLocaleString()}
                                    </span>
                                </div>

                                <div className="roi-result-row roi-border-bottom">
                                    <span className="roi-font-semibold" style={{ color: "#1f2937" }}>
                                        {t("results.newBidCapacity")}
                                    </span>
                                    <span className="roi-text-blue-alt roi-font-bold roi-text-lg">
                                        {roiResults.newBids}+
                                    </span>
                                </div>

                                <div className="roi-result-row roi-border-bottom">
                                    <span className="roi-font-semibold" style={{ color: "#1f2937" }}>
                                        {t("results.additionalRevenue")}
                                    </span>
                                    <span className="roi-text-blue-alt roi-font-bold roi-text-lg">
                                        ${Math.round(roiResults.additionalRevenue).toLocaleString()}
                                    </span>
                                </div>

                                <div className="roi-highlight-box roi-result-row">
                                    <span className="roi-highlight-text roi-font-semibold">{t("results.paybackPeriod")}</span>
                                    <span className="roi-highlight-text roi-font-bold roi-text-lg">
                                        {t("results.days", { count: roiResults.paybackDays })}
                                    </span>
                                </div>
                            </div>

                            <Link href="/contact" className="roi-btn-primary roi-mt-2 inline-block text-center">
                                {t("results.scheduleCta")}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
