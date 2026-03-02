"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

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

function ResultsContent({ id }: { id: string }) {
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attempt");
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/quiz/${id}`)
            .then((r) => r.json())
            .then((data) => {
                setQuiz(data);
                setLoading(false);
            });

        if (attemptId) {
            fetch(`/api/attempt/${attemptId}`)
                .then((r) => r.json())
                .then((data) => {
                    if (data.answers) setAnswers(JSON.parse(data.answers));
                    if (data.score !== undefined) setScore(data.score);
                });
        }
    }, [id, attemptId]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "120px 24px" }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!quiz) return null;

    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);
    const optionLabel: Record<string, string> = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };

    const getResultColor = () => {
        if (pct >= 80) return "#10d98a";
        if (pct >= 50) return "#ffb84d";
        return "#ff4d6d";
    };

    const getResultEmoji = () => {
        if (pct >= 80) return "🏆";
        if (pct >= 50) return "💪";
        return "📚";
    };

    const getResultMsg = () => {
        if (pct >= 80) return "Excellent work! You've mastered this material.";
        if (pct >= 50) return "Good effort! Review the explanations below to improve.";
        return "Keep practicing! Read the explanations to strengthen your understanding.";
    };

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "50px 24px 80px" }}>

                {/* Score Card */}
                <div
                    className="glass-strong animate-slide-up"
                    style={{ padding: "48px", textAlign: "center", marginBottom: "32px" }}
                >
                    <div style={{ fontSize: "64px", marginBottom: "16px" }}>{getResultEmoji()}</div>
                    <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "8px" }}>Quiz Complete!</h1>
                    <p style={{ color: "rgba(175,175,210,0.7)", marginBottom: "36px", fontSize: "15px" }}>{quiz.title}</p>

                    {/* Big Score */}
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "baseline",
                            gap: "4px",
                            padding: "24px 48px",
                            borderRadius: "20px",
                            background: `rgba(${pct >= 80 ? "16,217,138" : pct >= 50 ? "255,184,77" : "255,77,109"}, 0.08)`,
                            border: `1px solid ${getResultColor()}30`,
                            marginBottom: "24px",
                        }}
                    >
                        <span style={{ fontSize: "80px", fontWeight: 900, color: getResultColor(), lineHeight: 1 }}>{pct}</span>
                        <span style={{ fontSize: "32px", fontWeight: 700, color: getResultColor() }}>%</span>
                    </div>

                    <div style={{ fontSize: "16px", color: "rgba(175,175,210,0.8)", marginBottom: "12px" }}>
                        <strong style={{ color: getResultColor() }}>{score}</strong> out of <strong>{total}</strong> questions correct
                    </div>

                    <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>

                    <p style={{ color: "rgba(175,175,210,0.6)", marginTop: "20px", fontSize: "15px" }}>
                        {getResultMsg()}
                    </p>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "36px", flexWrap: "wrap" }}>
                        <Link href="/upload">
                            <button className="btn-primary">🤖 New Quiz</button>
                        </Link>
                        <Link href="/dashboard">
                            <button className="btn-secondary">📊 Dashboard</button>
                        </Link>
                    </div>
                </div>

                {/* Question breakdown */}
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
                    📋 Question Breakdown
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {quiz.questions.map((q, i) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correctAnswer;
                        const OPTIONS = ["A", "B", "C", "D"] as const;
                        type OptionKey = "optionA" | "optionB" | "optionC" | "optionD";
                        const optKeys: Record<string, OptionKey> = {
                            A: "optionA", B: "optionB", C: "optionC", D: "optionD"
                        };

                        return (
                            <div
                                key={q.id}
                                className="glass animate-fade-in"
                                style={{
                                    padding: "24px",
                                    borderColor: isCorrect ? "rgba(16,217,138,0.2)" : "rgba(255,77,109,0.2)",
                                }}
                            >
                                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
                                    <div
                                        style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            background: isCorrect ? "rgba(16,217,138,0.2)" : "rgba(255,77,109,0.15)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            flexShrink: 0,
                                            marginTop: "2px",
                                        }}
                                    >
                                        {isCorrect ? "✓" : "✗"}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(175,175,210,0.5)", marginBottom: "4px" }}>
                                            Q{i + 1}
                                        </div>
                                        <p style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0ff", lineHeight: 1.5 }}>
                                            {q.questionText}
                                        </p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                                    {OPTIONS.map((opt) => {
                                        const isCorrectOpt = opt === q.correctAnswer;
                                        const isUserOpt = opt === userAnswer;
                                        let bg = "rgba(255,255,255,0.02)";
                                        let borderColor = "rgba(255,255,255,0.06)";
                                        let textColor = "rgba(175,175,210,0.6)";

                                        if (isCorrectOpt) {
                                            bg = "rgba(16,217,138,0.08)";
                                            borderColor = "rgba(16,217,138,0.4)";
                                            textColor = "#10d98a";
                                        } else if (isUserOpt && !isCorrect) {
                                            bg = "rgba(255,77,109,0.07)";
                                            borderColor = "rgba(255,77,109,0.3)";
                                            textColor = "#ff4d6d";
                                        }

                                        return (
                                            <div
                                                key={opt}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    padding: "10px 14px",
                                                    borderRadius: "8px",
                                                    border: `1px solid ${borderColor}`,
                                                    background: bg,
                                                    fontSize: "14px",
                                                    color: textColor,
                                                }}
                                            >
                                                <span style={{ width: "20px", fontWeight: 700 }}>{opt}.</span>
                                                <span style={{ flex: 1 }}>{q[optKeys[opt]]}</span>
                                                {isCorrectOpt && <span>✓</span>}
                                                {isUserOpt && !isCorrectOpt && <span>✗</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <div
                                    style={{
                                        background: "rgba(79,110,247,0.06)",
                                        border: "1px solid rgba(79,110,247,0.15)",
                                        borderRadius: "10px",
                                        padding: "14px 16px",
                                        fontSize: "13px",
                                        color: "rgba(175,175,210,0.85)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    <span style={{ fontWeight: 700, color: "#6b8cff" }}>💡 Explanation: </span>
                                    {q.explanation}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", padding: "120px" }}><div className="spinner" /></div>}>
            <ResultsContent id={id} />
        </Suspense>
    );
}
