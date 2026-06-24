"use client";

export default function CaseStudies() {
    const studies = [
        {
            company: "Case Study 1: Residential Asphalt Contractor",
            location: "Utah | $5M Annual Revenue",
            challenge:
                "Owner was estimating projects at night after running crews during the day. Capped at 10-12 bids per month. Turning down $200K-300K in monthly opportunities. Couldn't justify hiring local estimator at $120K+ cost.",
            solution:
                "Matched with licensed civil engineer from Philippines. 5-year engineering degree, 4 years asphalt experience, PlanSwift & Bluebeam proficient. 90-day onboarding with structured training program.",
            metrics: [
                { number: "35", label: "Bids/Month" },
                { number: "28%", label: "Win Rate" },
                { number: "$7.2M", label: "Projected Revenue" },
                { number: "$94K", label: "Annual Savings" },
            ],
            quote:
                '"I was skeptical about remote estimators. I thought it meant \'offshore and unreliable.\' But [Engineer Name] is on every call, knows our specs, and honestly catches things I used to miss. Best business decision I made this year. I got my evenings back."',
        },
        {
            company: "Case Study 2: Commercial Asphalt Firm",
            location: "Colorado | $8M Annual Revenue",
            challenge:
                "Operations manager split between estimating and project oversight. Inconsistent bid turnaround (3-5 days). Complex commercial projects required senior-level technical detail. Needed capacity increase without significant payroll expansion.",
            solution:
                "Hired licensed CE with commercial construction background. Structured 90-day onboarding with weekly check-ins. Operations manager transitioned to quality review and client relationship focus.",
            metrics: [
                { number: "2x", label: "Bid Capacity" },
                { number: "22%", label: "Accuracy Improvement" },
                { number: "$12M", label: "Revenue (Year End)" },
                { number: "48hrs", label: "Turnaround" },
            ],
            quote:
                '"The training process was smooth. Communication is seamless. What impressed me most is they ask great questions about our process and actually improve our workflow. This has been a partnership, not just a service."',
        },
        {
            company: "Case Study 3: Growth-Stage Contractor",
            location: "Arizona | $4M → $8M Revenue",
            challenge:
                "Rapid growth trajectory required scaling estimating capacity without proportional overhead increase. Current estimator overwhelmed. Couldn't hire fast enough to keep up with market demand.",
            solution:
                "Added two remote estimators in parallel - one handling residential, one commercial specialty. Staggered onboarding allowed knowledge transfer and team development.",
            metrics: [
                { number: "100%", label: "Revenue Growth" },
                { number: "3x", label: "Bid Volume" },
                { number: "$4.5M", label: "Additional Revenue" },
                { number: "$140K", label: "Combined Savings" },
            ],
            quote:
                '"Scaling with remote estimators allowed us to grow revenue without the infrastructure costs of hiring locally. We saved $140K+ while more than doubling bid capacity. We\'re planning to add a third estimator next year."',
        },
    ];

    return (
        <section className="roi-section">
            <div className="roi-container">
                <h2 className="roi-heading">Real Results From Asphalt Contractors</h2>

                {studies.map((study, idx) => (
                    <div key={idx} className="roi-card-lg" style={{ overflow: "hidden", boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)", marginBottom: "40px" }}>
                        <div style={{ background: "linear-gradient(90deg, #2c84c4, #2371a8)", color: "#ffffff", padding: "32px" }}>
                            <div style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "8px" }}>{study.company}</div>
                            <div style={{ opacity: 0.9, fontSize: "0.875rem" }}>{study.location}</div>
                        </div>
                        <div style={{ padding: "32px" }}>
                            <div className="roi-mb-3">
                                <div className="roi-text-blue-alt roi-font-bold" style={{ fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Challenge
                                </div>
                                <div className="roi-text-gray roi-line-height-relaxed">{study.challenge}</div>
                            </div>
                            <div className="roi-mb-3">
                                <div className="roi-text-blue-alt roi-font-bold" style={{ fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>Solution</div>
                                <div className="roi-text-gray roi-line-height-relaxed">{study.solution}</div>
                            </div>
                            <div className="roi-mb-3">
                                <div className="roi-text-blue-alt roi-font-bold" style={{ fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Results (6 Months)
                                </div>
                                <div className="roi-grid-metrics">
                                    {study.metrics.map((metric, i) => (
                                        <div key={i} style={{ textAlign: "center" }}>
                                            <div className="roi-text-blue-alt roi-font-bold" style={{ fontSize: "1.5rem" }}>{metric.number}</div>
                                            <div className="roi-text-gray" style={{ fontSize: "0.75rem", marginTop: "4px" }}>{metric.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="roi-highlight-box" style={{ marginTop: "20px" }}>
                                <div className="roi-highlight-text" style={{ fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Client Quote
                                </div>
                                <div style={{ color: "#374151", fontStyle: "italic" }}>{study.quote}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
