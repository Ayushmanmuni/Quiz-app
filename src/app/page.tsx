import Link from "next/link";

export default function HomePage() {
    const features = [
        {
            icon: "📄",
            title: "Upload Any Document",
            desc: "Paste text or upload PDF/TXT files. Our AI understands your content.",
        },
        {
            icon: "🤖",
            title: "AI Question Generation",
            desc: "Hugging Face AI extracts key concepts and creates perfect MCQs automatically.",
        },
        {
            icon: "🎯",
            title: "3 Difficulty Levels",
            desc: "Easy, Medium, or Hard — tailored to your learning needs.",
        },
        {
            icon: "📊",
            title: "Track Your Progress",
            desc: "Every score is saved. Monitor improvement over time on your dashboard.",
        },
        {
            icon: "💡",
            title: "Detailed Explanations",
            desc: "Learn why each answer is correct with AI-generated explanations.",
        },
        {
            icon: "⚡",
            title: "Instant Results",
            desc: "Generate a 10-question quiz in seconds. Study smarter, not harder.",
        },
    ];

    const steps = [
        { num: "01", title: "Upload Content", desc: "Paste your text or upload a document" },
        { num: "02", title: "AI Generates Quiz", desc: "AI creates targeted MCQs" },
        { num: "03", title: "Take the Quiz", desc: "Answer questions at your own pace" },
        { num: "04", title: "Review & Learn", desc: "See explanations for every answer" },
    ];

    return (
        <div style={{ position: "relative" }}>
            <div className="bg-mesh" />

            {/* Hero Section */}
            <section
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "90px 24px 80px",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div className="animate-slide-up">
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "rgba(79, 110, 247, 0.12)",
                            border: "1px solid rgba(79, 110, 247, 0.3)",
                            borderRadius: "999px",
                            padding: "6px 16px",
                            marginBottom: "32px",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "#6b8cff",
                        }}
                    >
                        <span>⚡</span>
                        <span>Powered by Hugging Face AI</span>
                    </div>

                    <h1
                        style={{
                            fontSize: "clamp(40px, 7vw, 76px)",
                            fontWeight: 900,
                            lineHeight: 1.1,
                            marginBottom: "24px",
                            letterSpacing: "-1.5px",
                        }}
                    >
                        Turn Any Document Into
                        <br />
                        <span className="gradient-text">An AI-Powered Quiz</span>
                    </h1>

                    <p
                        style={{
                            fontSize: "18px",
                            color: "rgba(175, 175, 210, 0.9)",
                            maxWidth: "540px",
                            margin: "0 auto 48px",
                            lineHeight: 1.7,
                        }}
                    >
                        Upload text, PDFs, or study notes — our AI instantly creates
                        personalized multiple-choice quizzes with detailed explanations.
                    </p>

                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/register">
                            <button className="btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
                                🚀 Start for Free
                            </button>
                        </Link>
                        <Link href="/login">
                            <button className="btn-secondary" style={{ fontSize: "16px", padding: "14px 32px" }}>
                                Sign In
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Hero Visual */}
                <div
                    className="animate-float"
                    style={{
                        marginTop: "72px",
                        display: "inline-block",
                        position: "relative",
                    }}
                >
                    <div
                        className="glass-strong"
                        style={{
                            padding: "28px 32px",
                            maxWidth: "580px",
                            margin: "0 auto",
                            textAlign: "left",
                            boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 60px rgba(79, 110, 247, 0.12)",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff4d6d" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffb84d" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10d98a" }} />
                            </div>
                            <span style={{ fontSize: "13px", color: "rgba(175,175,210,0.6)", fontFamily: "monospace" }}>
                                AI Quiz Generator
                            </span>
                        </div>

                        <div
                            style={{
                                background: "rgba(79, 110, 247, 0.06)",
                                border: "1px solid rgba(79, 110, 247, 0.2)",
                                borderRadius: "10px",
                                padding: "12px 14px",
                                marginBottom: "16px",
                                fontSize: "13px",
                                color: "rgba(175,175,210,0.8)",
                            }}
                        >
                            📄 &nbsp;quantum_physics_notes.pdf &nbsp;
                            <span style={{ color: "#10d98a" }}>✓ Extracted 4,200 words</span>
                        </div>

                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#f0f0ff", marginBottom: "14px" }}>
                            Q3: What does the Heisenberg Uncertainty Principle state?
                        </p>

                        {[
                            { opt: "A", text: "Energy is conserved in all reactions", correct: false },
                            { opt: "B", text: "Matter can be converted to energy", correct: false },
                            { opt: "C", text: "You cannot know position and momentum simultaneously with perfect precision", correct: true },
                            { opt: "D", text: "Electrons travel in fixed orbits", correct: false },
                        ].map((o) => (
                            <div
                                key={o.opt}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "10px 12px",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    border: `1px solid ${o.correct ? "rgba(16,217,138,0.4)" : "rgba(255,255,255,0.06)"}`,
                                    background: o.correct ? "rgba(16,217,138,0.08)" : "rgba(255,255,255,0.02)",
                                    fontSize: "13px",
                                    color: o.correct ? "#10d98a" : "rgba(175,175,210,0.7)",
                                }}
                            >
                                <span
                                    style={{
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        background: o.correct ? "rgba(16,217,138,0.2)" : "rgba(255,255,255,0.05)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}
                                >
                                    {o.opt}
                                </span>
                                {o.text}
                                {o.correct && <span style={{ marginLeft: "auto" }}>✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "80px 24px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, marginBottom: "12px" }}>
                        How it <span className="gradient-text-blue">works</span>
                    </h2>
                    <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "16px" }}>
                        From document to quiz in under 30 seconds
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="glass card-hover"
                            style={{ padding: "28px 24px", position: "relative", overflow: "hidden" }}
                        >
                            <div
                                style={{
                                    fontSize: "42px",
                                    fontWeight: 900,
                                    color: "rgba(79, 110, 247, 0.15)",
                                    position: "absolute",
                                    top: "12px",
                                    right: "16px",
                                    fontFamily: "monospace",
                                    lineHeight: 1,
                                }}
                            >
                                {step.num}
                            </div>
                            <p style={{ fontSize: "22px", marginBottom: "12px" }}>
                                {["📄", "🤖", "✏️", "💡"][i]}
                            </p>
                            <h3 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{step.title}</h3>
                            <p style={{ fontSize: "14px", color: "rgba(175,175,210,0.7)", lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "40px 24px 80px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, marginBottom: "12px" }}>
                        Everything you <span className="gradient-text">need to learn</span>
                    </h2>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="glass card-hover"
                            style={{
                                padding: "28px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                            }}
                        >
                            <div style={{ fontSize: "32px" }}>{f.icon}</div>
                            <h3 style={{ fontWeight: 700, fontSize: "17px" }}>{f.title}</h3>
                            <p style={{ fontSize: "14px", color: "rgba(175,175,210,0.7)", lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    padding: "40px 24px 100px",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <div
                    className="glass-strong"
                    style={{
                        padding: "60px 40px",
                        boxShadow: "0 40px 120px rgba(0,0,0,0.4), 0 0 60px rgba(79, 110, 247, 0.1)",
                    }}
                >
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, marginBottom: "16px" }}>
                        Ready to level up your learning?
                    </h2>
                    <p style={{ color: "rgba(175,175,210,0.8)", marginBottom: "36px", fontSize: "16px" }}>
                        Join and start generating AI-powered quizzes today. Free forever.
                    </p>
                    <Link href="/register">
                        <button className="btn-primary" style={{ fontSize: "16px", padding: "16px 40px" }}>
                            🚀 Create Free Account
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
