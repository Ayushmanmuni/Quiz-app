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
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 72px)" }}>
                <div style={{ textAlign: "center" }}>
                    <div className="spinner" style={{ margin: "0 auto 16px" }} />
                    <p style={{ color: "rgba(175,175,210,0.7)" }}>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalQuestions) * 100, 0) / attempts.length) : 0;
    const bestScore = attempts.length ? Math.max(...attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100))) : 0;

    const stats = [
        { label: "Total Quizzes", value: attempts.length, icon: "📝" },
        { label: "Avg Score", value: `${avgScore}%`, icon: "📊" },
        { label: "Best Score", value: `${bestScore}%`, icon: "🏆" },
        { label: "This Week", value: attempts.filter((a) => { const d = new Date(a.completedAt); const now = new Date(); return (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 7; }).length, icon: "🗓️" },
    ];

    const getDifficultyBadge = (d: string) => `badge badge-${d}`;
    const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "1000px", margin: "0 auto", padding: "50px 24px 80px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "16px" }}>
                    <div className="animate-slide-up">
                        <h1 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "6px" }}>Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋</h1>
                        <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "15px" }}>Track your quiz progress and start new challenges.</p>
                    </div>
                    <Link href="/upload"><button className="btn-primary">+ New Quiz</button></Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {stats.map((s, i) => (
                        <div key={i} className="glass card-hover" style={{ padding: "24px" }}>
                            <div style={{ fontSize: "28px", marginBottom: "10px" }}>{s.icon}</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px", color: "#6b8cff" }}>{s.value}</div>
                            <div style={{ fontSize: "13px", color: "rgba(175,175,210,0.6)", fontWeight: 500 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>Recent Quizzes</h2>
                    {attempts.length === 0 ? (
                        <div className="glass-strong" style={{ padding: "60px 40px", textAlign: "center" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎯</div>
                            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>No quizzes yet</h3>
                            <p style={{ color: "rgba(175,175,210,0.6)", marginBottom: "28px", fontSize: "15px" }}>Generate your first AI-powered quiz from any document or text.</p>
                            <Link href="/upload"><button className="btn-primary">🤖 Generate First Quiz</button></Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {attempts.map((attempt) => {
                                const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                const color = pct >= 80 ? "#10d98a" : pct >= 50 ? "#ffb84d" : "#ff4d6d";
                                return (
                                    <div key={attempt.id} className="glass card-hover" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                                            <div style={{ position: "absolute", inset: "6px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color }}>{pct}%</div>
                                        </div>
                                        <div style={{ flex: 1, minWidth: "160px" }}>
                                            <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px", color: "#f0f0ff" }}>{attempt.quiz.title}</div>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                                                <span className={getDifficultyBadge(attempt.quiz.difficulty)}>{attempt.quiz.difficulty}</span>
                                                <span style={{ fontSize: "12px", color: "rgba(175,175,210,0.5)" }}>{attempt.score}/{attempt.totalQuestions} correct</span>
                                                <span style={{ fontSize: "12px", color: "rgba(175,175,210,0.4)" }}>{formatDate(attempt.completedAt)}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <Link href={`/quiz/${attempt.quizId}/results?attempt=${attempt.id}`}><button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px" }}>Review</button></Link>
                                            <Link href={`/quiz/${attempt.quizId}`}><button className="btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>Retake</button></Link>
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
