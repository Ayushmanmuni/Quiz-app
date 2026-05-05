"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Attempt {
    id: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quiz: { title: string; difficulty: string };
    quizId: string;
}

const SCORE_COLORS: Record<string, string> = {
    high:   "#34D399",
    medium: "#FBBF24",
    low:    "#F87171",
};

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (status === "authenticated") {
            fetch("/api/attempt")
                .then((r) => r.json())
                .then((data) => { setAttempts(Array.isArray(data) ? data : []); setLoading(false); });
        }
    }, [status, router]);

    if (status === "loading" || loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 70px)" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "52px", marginBottom: "16px" }} className="animate-wiggle">🧠</div>
                    <div className="spinner" style={{ margin: "0 auto 16px" }} />
                    <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const avgScore  = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalQuestions) * 100, 0) / attempts.length) : 0;
    const bestScore = attempts.length ? Math.max(...attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100))) : 0;
    const thisWeek  = attempts.filter((a) => (new Date().getTime() - new Date(a.completedAt).getTime()) / (1000 * 60 * 60 * 24) <= 7).length;

    const stats = [
        { label: "Total Quizzes",   value: attempts.length, icon: "📝", color: "rgba(139,92,246,", glow: "rgba(139,92,246,0.2)" },
        { label: "Avg Score",       value: `${avgScore}%`,  icon: "📊", color: "rgba(56,189,248,",  glow: "rgba(56,189,248,0.2)" },
        { label: "Best Score",      value: `${bestScore}%`, icon: "🏆", color: "rgba(251,191,36,",  glow: "rgba(251,191,36,0.2)" },
        { label: "This Week",       value: thisWeek,        icon: "🔥", color: "rgba(248,113,113,", glow: "rgba(248,113,113,0.2)" },
    ];

    const getScoreKey = (pct: number) => pct >= 80 ? "high" : pct >= 50 ? "medium" : "low";
    const formatDate  = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", padding: "50px 24px 80px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
                    <div className="animate-slide-up">
                        <h1 style={{ fontSize: "30px", fontWeight: 900, marginBottom: "6px" }}>
                            Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "15px", fontWeight: 600 }}>Track your quiz progress and start new challenges.</p>
                    </div>
                    <Link href="/upload">
                        <button className="btn-primary" style={{ padding: "12px 26px" }}>✨ New Quiz</button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {stats.map((s, i) => (
                        <div key={i} className="glass card-hover" style={{ padding: "24px", borderColor: `${s.color}0.25)` }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "14px",
                                    background: `${s.color}0.15)`,
                                    border: `1.5px solid ${s.color}0.3)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "24px",
                                    marginBottom: "14px",
                                }}
                            >
                                {s.icon}
                            </div>
                            <div style={{ fontSize: "30px", fontWeight: 900, marginBottom: "4px", color: `${s.color}0.95)` }}>{s.value}</div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 700 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Quizzes */}
                <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "20px" }}>🕐 Recent Quizzes</h2>
                    {attempts.length === 0 ? (
                        <div className="glass-strong" style={{ padding: "60px 40px", textAlign: "center" }}>
                            <div style={{ fontSize: "72px", marginBottom: "16px" }} className="animate-float">🦄</div>
                            <h3 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "10px" }}>No quizzes yet!</h3>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "28px", fontSize: "15px", fontWeight: 600 }}>
                                Generate your first AI-powered quiz from any document, topic, or text. It&apos;s free! 🚀
                            </p>
                            <Link href="/upload">
                                <button className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>✨ Generate First Quiz</button>
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {attempts.map((attempt) => {
                                const pct      = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                const scoreKey = getScoreKey(pct);
                                const color    = SCORE_COLORS[scoreKey];
                                return (
                                    <div key={attempt.id} className="glass card-hover" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                                        {/* Score ring */}
                                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                                            <div style={{ position: "absolute", inset: "6px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", color }}>{pct}%</div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: "160px" }}>
                                            <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "5px", color: "var(--text-primary)" }}>{attempt.quiz.title}</div>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                                <span className={`badge badge-${attempt.quiz.difficulty}`}>{attempt.quiz.difficulty}</span>
                                                {attempt.quiz.mode && attempt.quiz.mode !== "standard" && (
                                                    <span className="badge" style={{ background: attempt.quiz.mode === "study" ? "rgba(56,189,248,0.15)" : "rgba(236,72,153,0.15)", color: attempt.quiz.mode === "study" ? "#38BDF8" : "#EC4899", border: `1.5px solid ${attempt.quiz.mode === "study" ? "rgba(56,189,248,0.3)" : "rgba(236,72,153,0.3)"}` }}>
                                                        {attempt.quiz.mode === "study" ? "📖 Study" : "🎯 Adaptive"}
                                                    </span>
                                                )}
                                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 700 }}>{attempt.score}/{attempt.totalQuestions} correct</span>
                                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.6 }}>{formatDate(attempt.completedAt)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <Link href={`/quiz/${attempt.quizId}/results?attempt=${attempt.id}`}>
                                                <button className="btn-secondary" style={{ padding: "8px 18px", fontSize: "13px" }}>Review</button>
                                            </Link>
                                            <Link href={`/quiz/${attempt.quizId}`}>
                                                <button className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>Retake 🔁</button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
