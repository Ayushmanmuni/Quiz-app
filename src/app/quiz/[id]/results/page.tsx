"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

interface Question {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
}

interface Quiz {
    id: string;
    title: string;
    difficulty: string;
    questions: Question[];
}

const OPT_COLORS: Record<string, string> = { A: "#38BDF8", B: "#FBBF24", C: "#F87171", D: "#34D399" };

function ResultsContent({ id }: { id: string }) {
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attempt");
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/quiz?id=${id}`)
            .then((r) => r.json())
            .then((data) => { setQuiz(data); setLoading(false); });
        if (attemptId) {
            fetch(`/api/attempt?id=${attemptId}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.answers) setAnswers(JSON.parse(data.answers));
                    if (data.score !== undefined) setScore(data.score);
                });
        }
    }, [id, attemptId]);

    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "120px 24px", gap: "16px" }}>
            <div style={{ fontSize: "48px" }} className="animate-wiggle">🧠</div>
            <div className="spinner" />
        </div>
    );
    if (!quiz) return null;

    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);

    const getResultColor = () => pct >= 80 ? "#34D399" : pct >= 50 ? "#FBBF24" : "#F87171";
    const getResultEmoji = () => pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚";
    const getResultMsg   = () => pct >= 80 ? "Excellent work! You've mastered this material! 🌟" : pct >= 50 ? "Good effort! Review the explanations below to improve. 💡" : "Keep practicing! Read the explanations to strengthen your understanding. 🔥";
    const getCelebEmojis = () => pct >= 80 ? ["🎉", "🌟", "⭐", "🎊", "✨", "🏆", "🥳", "💫"] : pct >= 50 ? ["💪", "👍", "⭐", "🎯", "✨"] : ["📚", "💡", "🔥", "📖", "🎯"];

    const celebEmojis = getCelebEmojis();

    return (
        <>
            <HeroGeometric 
                badge="Quiz Complete"
                title1="Review Your" 
                title2="Quiz Results"
            />
            <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "50px 24px 80px" }}>

                {/* Score Card */}
                <div className="glass-strong animate-slide-up" style={{ padding: "48px", textAlign: "center", marginBottom: "32px", position: "relative", overflow: "hidden" }}>

                    {/* Floating celebration emojis */}
                    {celebEmojis.map((emoji, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                fontSize: "24px",
                                opacity: 0.15,
                                top: `${10 + (i * 17) % 70}%`,
                                left: `${5 + (i * 23) % 90}%`,
                                animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                                animationDelay: `${i * 0.4}s`,
                                pointerEvents: "none",
                            }}
                        >
                            {emoji}
                        </div>
                    ))}

                    <div style={{ fontSize: "70px", marginBottom: "16px", position: "relative", zIndex: 1 }} className="animate-bounce">{getResultEmoji()}</div>
                    <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px", position: "relative", zIndex: 1 }}>Quiz Complete! 🎊</h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "36px", fontSize: "15px", fontWeight: 600, position: "relative", zIndex: 1 }}>{quiz.title}</p>

                    {/* Score display */}
                    <div
                        className="animate-pop"
                        style={{
                            display: "inline-flex",
                            alignItems: "baseline",
                            gap: "4px",
                            padding: "28px 56px",
                            borderRadius: "24px",
                            background: `rgba(${pct >= 80 ? "52,211,153" : pct >= 50 ? "251,191,36" : "248,113,113"}, 0.1)`,
                            border: `2px solid ${getResultColor()}50`,
                            marginBottom: "24px",
                            position: "relative",
                            zIndex: 1,
                            boxShadow: `0 0 40px ${getResultColor()}30`,
                        }}
                    >
                        <span style={{ fontSize: "88px", fontWeight: 900, color: getResultColor(), lineHeight: 1 }}>{pct}</span>
                        <span style={{ fontSize: "36px", fontWeight: 800, color: getResultColor() }}>%</span>
                    </div>

                    <div style={{ fontSize: "16px", color: "var(--text-secondary)", marginBottom: "14px", fontWeight: 600, position: "relative", zIndex: 1 }}>
                        <strong style={{ color: getResultColor() }}>{score}</strong> out of <strong style={{ color: "var(--text-primary)" }}>{total}</strong> questions correct
                    </div>

                    <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                    <p style={{ color: "var(--text-secondary)", marginTop: "20px", fontSize: "15px", fontWeight: 600, position: "relative", zIndex: 1 }}>{getResultMsg()}</p>

                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "36px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                        <Link href="/upload"><button className="btn-primary" style={{ padding: "13px 28px" }}>✨ New Quiz</button></Link>
                        <Link href="/dashboard"><button className="btn-secondary" style={{ padding: "13px 28px" }}>📊 Dashboard</button></Link>
                    </div>
                </div>

                {/* Breakdown */}
                <h2 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "20px" }}>📋 Question Breakdown</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {quiz.questions.map((q, i) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correctAnswer;
                        const OPTIONS = ["A", "B", "C", "D"] as const;
                        type OptionKey = "optionA" | "optionB" | "optionC" | "optionD";
                        const optKeys: Record<string, OptionKey> = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };

                        return (
                            <div
                                key={q.id}
                                className="glass animate-fade-in"
                                style={{ padding: "24px", borderColor: isCorrect ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)" }}
                            >
                                {/* Question header */}
                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: isCorrect ? "rgba(52,211,153,0.18)" : "rgba(248,113,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0, marginTop: "2px" }}>
                                        {isCorrect ? "✅" : "❌"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "4px" }}>Q{i + 1}</div>
                                        <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.5 }}>{q.questionText}</p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                                    {OPTIONS.map((opt) => {
                                        const isCorrectOpt = opt === q.correctAnswer;
                                        const isUserOpt    = opt === userAnswer;
                                        const optColor     = OPT_COLORS[opt];

                                        let bg          = "rgba(255,255,255,0.02)";
                                        let borderColor = `${optColor}18`;
                                        let textColor   = "var(--text-secondary)";

                                        if (isCorrectOpt)              { bg = "rgba(52,211,153,0.09)";  borderColor = "rgba(52,211,153,0.45)";  textColor = "#34D399"; }
                                        else if (isUserOpt && !isCorrect) { bg = "rgba(248,113,113,0.08)"; borderColor = "rgba(248,113,113,0.35)"; textColor = "#F87171"; }

                                        return (
                                            <div key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: `1.5px solid ${borderColor}`, background: bg, fontSize: "14px", color: textColor, fontWeight: 600 }}>
                                                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: `${optColor}20`, border: `1px solid ${optColor}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: optColor, flexShrink: 0 }}>{opt}</span>
                                                <span style={{ flex: 1 }}>{q[optKeys[opt]]}</span>
                                                {isCorrectOpt && <span style={{ fontWeight: 900 }}>✓</span>}
                                                {isUserOpt && !isCorrectOpt && <span>✗</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <div style={{ background: "rgba(139,92,246,0.07)", border: "1.5px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "14px 16px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 500 }}>
                                    <span style={{ fontWeight: 800, color: "var(--accent-light)" }}>💡 Explanation: </span>{q.explanation}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "40px", flexWrap: "wrap" }}>
                    <Link href="/upload"><button className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>✨ Generate New Quiz</button></Link>
                    <Link href="/dashboard"><button className="btn-secondary" style={{ padding: "14px 32px", fontSize: "16px" }}>📊 View Dashboard</button></Link>
                </div>
            </div>
        </div>
        </>
    );
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "120px", gap: "16px" }}>
                <div style={{ fontSize: "48px" }} className="animate-wiggle">🧠</div>
                <div className="spinner" />
            </div>
        }>
            <ResultsContent id={id} />
        </Suspense>
    );
}
