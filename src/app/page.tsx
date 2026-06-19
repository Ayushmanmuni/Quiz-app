"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

export default function HomePage() {
    const { data: session } = useSession();

    const features = [
        { icon: "📄", title: "Upload Any Document", desc: "Paste text or upload PDF/TXT files. Our AI understands your content instantly.", color: "violet" },
        { icon: "🤖", title: "AI Question Generation", desc: "Hugging Face AI extracts key concepts and creates perfect MCQs automatically.", color: "sky" },
        { icon: "🎯", title: "3 Difficulty Levels", desc: "Easy, Medium, or Hard — tailored to your learning needs and pace.", color: "amber" },
        { icon: "📊", title: "Track Your Progress", desc: "Every score is saved. Monitor improvement over time on your dashboard.", color: "teal" },
        { icon: "💡", title: "Detailed Explanations", desc: "Learn why each answer is correct with AI-generated explanations.", color: "pink" },
        { icon: "⚡", title: "Instant Results", desc: "Generate a 10-question quiz in seconds. Study smarter, not harder.", color: "coral" },
    ];

    const steps = [
        { num: "01", title: "Upload Content", desc: "Paste your text or upload a document", emoji: "📄", color: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.3)" },
        { num: "02", title: "AI Generates Quiz", desc: "AI creates targeted MCQs instantly", emoji: "🤖", color: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.3)" },
        { num: "03", title: "Take the Quiz", desc: "Answer questions at your own pace", emoji: "✏️", color: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)" },
        { num: "04", title: "Review & Learn", desc: "See explanations for every answer", emoji: "🏆", color: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.3)" },
    ];

    const decorEmojis = [
        { e: "⭐", top: "12%", left: "6%", delay: "0s", duration: "4s" },
        { e: "🌟", top: "20%", right: "8%", delay: "0.8s", duration: "5s" },
        { e: "✨", top: "60%", left: "3%", delay: "1.5s", duration: "6s" },
        { e: "🎉", top: "75%", right: "5%", delay: "0.3s", duration: "4.5s" },
        { e: "💫", top: "40%", right: "3%", delay: "2s", duration: "5.5s" },
    ];

    const [reducedMotion, setReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        try {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
            if (mq.addEventListener) mq.addEventListener('change', handler);
            else (mq as any).addListener(handler);
            return () => {
                if (mq.removeEventListener) mq.removeEventListener('change', handler);
                else (mq as any).removeListener(handler);
            };
        } catch {
            // ignore on SSR
        }
    }, []);

    return (
        <>
            <HeroGeometric 
                badge="AI-Powered Learning"
                title1="Turn Any Document Into" 
                title2="An AI-Powered Quiz"
            />
            <div style={{ position: "relative" }}>
            <div className="bg-mesh" />

            {/* Floating decoration emojis (decorative only; respects reduced-motion) */}
            {decorEmojis.map((d, i) => (
                <div
                    key={i}
                    className={reducedMotion ? undefined : "animate-float"}
                    role="img"
                    aria-hidden={true}
                    style={{
                        position: "fixed",
                        top: d.top,
                        left: (d as { left?: string }).left,
                        right: (d as { right?: string }).right,
                        fontSize: "24px",
                        opacity: 0.35,
                        pointerEvents: "none",
                        zIndex: 0,
                        animationDelay: reducedMotion ? undefined : d.delay,
                        animationDuration: reducedMotion ? undefined : d.duration,
                        animationPlayState: reducedMotion ? 'paused' : undefined,
                    }}
                >
                    {d.e}
                </div>
            ))}

            {/* Hero */}
            <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "90px 24px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
                <div className="animate-slide-up">
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(139, 92, 246, 0.14)", border: "1.5px solid rgba(139, 92, 246, 0.35)", borderRadius: "999px", padding: "7px 18px", marginBottom: "32px", fontSize: "13px", fontWeight: 800, color: "#A78BFA" }}>
                        <span>🧠</span><span>Powered by Hugging Face AI</span>
                    </div>

                    <h1 style={{ fontSize: "clamp(38px, 7vw, 76px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "24px", letterSpacing: "-1.5px" }}>
                        Turn Any Document Into<br /><span className="gradient-text">An AI-Powered Quiz</span>
                    </h1>

                    <p style={{ fontSize: "18px", color: "var(--text-secondary)", maxWidth: "540px", margin: "0 auto 48px", lineHeight: 1.7, fontWeight: 500 }}>
                        Upload text, PDFs, or study notes — our AI instantly creates personalized multiple-choice quizzes with detailed explanations. 🎓
                    </p>

                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                        {session ? (
                            <>
                                <Link href="/upload">
                                    <button className="btn-primary" style={{ fontSize: "16px", padding: "15px 36px" }}>✨ Create New Quiz</button>
                                </Link>
                                <Link href="/dashboard">
                                    <button className="btn-secondary" style={{ fontSize: "16px", padding: "15px 36px" }}>📊 Dashboard</button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/register">
                                    <button className="btn-primary" style={{ fontSize: "16px", padding: "15px 36px" }}>🚀 Start for Free</button>
                                </Link>
                                <Link href="/login">
                                    <button className="btn-secondary" style={{ fontSize: "16px", padding: "15px 36px" }}>Sign In</button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="animate-float" style={{ marginTop: "72px", display: "block", position: "relative", width: "100%" }}>
                    <div className="glass-strong" style={{ padding: "clamp(16px, 5vw, 32px)", maxWidth: "580px", width: "100%", margin: "0 auto", textAlign: "left", boxShadow: "0 40px 120px rgba(0,0,0,0.5), 0 0 60px rgba(139, 92, 246, 0.15)", boxSizing: "border-box" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#F87171" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#FBBF24" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#34D399" }} />
                            </div>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "monospace" }}>AI Quiz Generator 🧠</span>
                        </div>
                        <div style={{ background: "rgba(139, 92, 246, 0.07)", border: "1px solid rgba(139, 92, 246, 0.22)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "13px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            📄 &nbsp;quantum_physics_notes.pdf &nbsp;<span style={{ color: "#34D399", fontWeight: 700 }}>✓ Extracted 4,200 words</span>
                        </div>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>Q3: What does the Heisenberg Uncertainty Principle state?</p>
                        {[
                            { opt: "A", text: "Energy is conserved in all reactions", correct: false, color: "#38BDF8" },
                            { opt: "B", text: "Matter can be converted to energy", correct: false, color: "#FBBF24" },
                            { opt: "C", text: "You cannot know position and momentum simultaneously with perfect precision", correct: true, color: "#F87171" },
                            { opt: "D", text: "Electrons travel in fixed orbits", correct: false, color: "#34D399" },
                        ].map((o) => (
                            <div key={o.opt} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", marginBottom: "8px", border: `1px solid ${o.correct ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.06)"}`, background: o.correct ? "rgba(52,211,153,0.09)" : "rgba(255,255,255,0.02)", fontSize: "13px", color: o.correct ? "#34D399" : "var(--text-secondary)" }}>
                                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: o.correct ? "rgba(52,211,153,0.2)" : `rgba(0,0,0,0)`, border: `1px solid ${o.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: o.color, flexShrink: 0 }}>{o.opt}</span>
                                <span style={{ wordBreak: "break-word" }}>{o.text}</span>
                                {o.correct && <span style={{ marginLeft: "auto", fontWeight: 800, flexShrink: 0 }}>✓</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, marginBottom: "12px" }}>How it <span className="gradient-text-blue">works</span> ✨</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 500 }}>From document to quiz in under 30 seconds</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "20px" }}>
                    {steps.map((step, i) => (
                        <div key={i} className="glass card-hover" style={{ padding: "28px 24px", position: "relative", overflow: "hidden", borderColor: step.border }}>
                            <div style={{ fontSize: "42px", fontWeight: 900, color: step.border.replace("0.3", "0.12"), position: "absolute", top: "12px", right: "16px", fontFamily: "monospace", lineHeight: 1 }}>{step.num}</div>
                            <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: step.color, border: `1px solid ${step.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "16px" }}>{step.emoji}</div>
                            <h3 style={{ fontWeight: 800, fontSize: "16px", marginBottom: "8px" }}>{step.title}</h3>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px", position: "relative", zIndex: 1 }}>
                <div style={{ textAlign: "center", marginBottom: "60px" }}>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, marginBottom: "12px" }}>Everything you <span className="gradient-text">need to learn</span></h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "20px" }}>
                    {features.map((f, i) => (
                        <div key={i} className="glass card-hover" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div className={`icon-circle icon-circle-${f.color}`}>{f.icon}</div>
                            <h3 style={{ fontWeight: 800, fontSize: "17px" }}>{f.title}</h3>
                            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats strip */}
            <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px", position: "relative", zIndex: 1 }}>
                <div className="glass" style={{ padding: "clamp(16px, 4vw, 32px) clamp(20px, 5vw, 40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", gap: "24px", textAlign: "center" }}>
                    {[
                        { val: "10s", label: "Quiz generated", emoji: "⚡" },
                        { val: "3", label: "Difficulty levels", emoji: "🎯" },
                        { val: "∞", label: "Topics supported", emoji: "📚" },
                        { val: "100%", label: "Free to use", emoji: "🎉" },
                    ].map((s, i) => (
                        <div key={i}>
                            <div style={{ fontSize: "24px", marginBottom: "4px" }}>{s.emoji}</div>
                            <div style={{ fontSize: "32px", fontWeight: 900, marginBottom: "4px" }} className="gradient-text">{s.val}</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px 100px", textAlign: "center", position: "relative", zIndex: 1 }}>
                <div className="glass-strong animate-pulse-glow" style={{ padding: "clamp(30px, 8vw, 60px) clamp(20px, 6vw, 40px)", boxSizing: "border-box", width: "100%" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
                    <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginBottom: "16px" }}>
                        {session ? "Ready to test your knowledge?" : "Ready to level up your learning?"}
                    </h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "36px", fontSize: "16px", fontWeight: 500 }}>
                        {session ? "Create a new quiz from any topic or document. Let's go! 🎊" : "Join and start generating AI-powered quizzes today. Free forever! 🎊"}
                    </p>
                    <Link href={session ? "/upload" : "/register"}>
                        <button className="btn-primary" style={{ fontSize: "17px", padding: "17px 44px" }}>
                            {session ? "✨ Create New Quiz" : "🌟 Create Free Account"}
                        </button>
                    </Link>
                </div>
            </section>
        </div>
        </>
    );
}
