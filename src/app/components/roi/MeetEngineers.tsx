"use client";

export default function MeetEngineers() {
    return (
        <section className="roi-section">
            <div className="roi-container">
                <h2 className="roi-heading-sm">Meet Licensed Civil Engineers</h2>
                <p className="roi-subheading">
                    All engineers are licensed civil engineers with 5-year engineering degrees, Washington
                    Accord certification, and asphalt specialization training.
                </p>
                <div className="roi-grid-3 roi-mb-4">
                    {[
                        {
                            name: "Raul Santos",
                            role: "Licensed Civil Engineer | PlanSwift Specialist",
                            credentials: [
                                "5-Year Engineering Degree (UP Diliman)",
                                "Licensed Civil Engineer (PRC)",
                                "8+ Years Asphalt Experience",
                                "PlanSwift & Bluebeam Certified",
                                "Fluent English - Neutral Accent",
                            ],
                        },
                        {
                            name: "Maria Gonzales",
                            role: "Licensed Civil Engineer | Estimating Lead",
                            credentials: [
                                "5-Year Engineering Degree (Mapúa)",
                                "Licensed Civil Engineer (PRC)",
                                "6+ Years Commercial Asphalt",
                                "HCSS HeavyBid Proficient",
                                "Advanced English Communication",
                            ],
                        },
                        {
                            name: "Carlos De Leon",
                            role: "Licensed Civil Engineer | Quality Assurance",
                            credentials: [
                                "5-Year Engineering Degree (DLSU)",
                                "Licensed Civil Engineer (PRC)",
                                "10+ Years Infrastructure",
                                "AutoCAD & Revit Expert",
                                "DOT Spec Knowledge",
                            ],
                        },
                    ].map((engineer, idx) => (
                        <div
                            key={idx}
                            className="roi-card"
                            style={{
                                overflow: "hidden",
                                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
                                transition: "transform 0.3s ease",
                                padding: "0",
                            }}
                            onMouseEnter={(e) => {
                                if (window.innerWidth >= 768) {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (window.innerWidth >= 768) {
                                    e.currentTarget.style.transform = "translateY(0)";
                                }
                            }}
                        >
                            <div style={{
                                background: "linear-gradient(135deg, #2c84c4, #2371a8)",
                                height: "192px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffffff",
                                fontSize: "1.125rem",
                                fontWeight: "600",
                                margin: "0",
                                padding: "0",
                                width: "100%",
                                borderTopLeftRadius: "8px",
                                borderTopRightRadius: "8px",
                            }}>
                                Engineer Profile {idx + 1}
                            </div>
                            <div style={{ padding: "24px" }}>
                                <div className="roi-text-lg roi-font-bold roi-text-dark roi-mb-1">{engineer.name}</div>
                                <div className="roi-text-blue-alt roi-text-sm roi-mb-2">{engineer.role}</div>
                                <ul className="roi-flex-col" style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                                    {engineer.credentials.map((cred, i) => (
                                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                                            <span style={{ color: "#10b981", fontWeight: "700" }}>✓</span>
                                            <span>{cred}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="roi-bg-gray" style={{ padding: "40px", borderRadius: "8px", marginTop: "32px" }}>
                    <h3 className="roi-text-dark roi-mb-3" style={{ fontSize: "1.5rem", fontWeight: "700" }}>Why Our Engineers Excel</h3>
                    <div className="roi-grid-4">
                        {[
                            {
                                title: "Washington Accord™",
                                desc: "International credential recognition - equivalent to US engineering degrees",
                            },
                            {
                                title: "Licensed Professionals",
                                desc: "Passed rigorous PRC exam (30-35% pass rate = US PE rigor)",
                            },
                            {
                                title: "English Fluency",
                                desc: "Philippines ranks 20th globally - higher than India, China, most of Asia",
                            },
                            {
                                title: "Work Ethic",
                                desc: "94% retention rate - commitment to excellence and client relationships",
                            },
                        ].map((item, idx) => (
                            <div key={idx}>
                                <strong className="roi-text-blue-alt" style={{ display: "block", marginBottom: "8px" }}>{item.title}</strong>
                                <p className="roi-text-gray roi-text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
