"use client";

import { useEffect, useState, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Question {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    difficulty: string;
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    difficulty: string;
    mode: string;
    sourceText: string;
    questions: Question[];
}

const OPT_CLASSES: Record<string, string> = { A: "option-btn option-btn-a", B: "option-btn option-btn-b", C: "option-btn option-btn-c", D: "option-btn option-btn-d" };
const BADGE_CLASSES: Record<string, string> = { A: "opt-badge opt-badge-a", B: "opt-badge opt-badge-b", C: "opt-badge opt-badge-c", D: "opt-badge opt-badge-d" };

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [studyPhase, setStudyPhase] = useState(true);
    const [adaptiveOrder, setAdaptiveOrder] = useState<number[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = useCallback((s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }, []);

    // Start timer when study phase ends or quiz loads (non-study)
    useEffect(() => {
        if (!quiz || loading) return;
        if (quiz.mode === "study" && studyPhase) return; // don't tick during study reading
        timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [quiz, loading, studyPhase]);

    useEffect(() => {
        fetch(`/api/quiz?id=${id}`)
            .then((r) => r.json())
            .then((data) => {
                setQuiz(data);
                setLoading(false);
                if (data.mode === "adaptive" && data.questions?.length) {
                    const easy = data.questions.filter((q: Question) => q.difficulty === "easy").map((_: Question, i: number) => data.questions.indexOf(data.questions.filter((q: Question) => q.difficulty === "easy")[i]));
                    const med  = data.questions.filter((q: Question) => q.difficulty === "medium").map((_: Question, i: number) => data.questions.indexOf(data.questions.filter((q: Question) => q.difficulty === "medium")[i]));
                    const hard = data.questions.filter((q: Question) => q.difficulty === "hard").map((_: Question, i: number) => data.questions.indexOf(data.questions.filter((q: Question) => q.difficulty === "hard")[i]));
                    setAdaptiveOrder([...med, ...easy, ...hard].slice(0, data.questions.length));
                }
                if (data.mode !== "study") setStudyPhase(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleSelect = (questionId: string, option: string) => {
        if (studyPhase) return;
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => { if (currentQ < (quiz?.questions.length ?? 0) - 1) setCurrentQ((prev) => prev + 1); };
    const handlePrev = () => { if (currentQ > 0) setCurrentQ((prev) => prev - 1); };

    const handleSubmit = async () => {
        if (!quiz) return;
        setSubmitting(true);
        const score = quiz.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
        const res = await fetch("/api/attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizId: quiz.id, answers, score, totalQuestions: quiz.questions.length }),
        });
        setSubmitting(false);
        if (res.ok) {
            const data = await res.json();
            router.push(`/quiz/${id}/results?attempt=${data.attemptId}`);
        }
    };

    if (!session) return (
        <div style={{ textAlign: "center", padding: "120px 24px" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🔐</div>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 600 }}>
                Please <a href="/login" style={{ color: "var(--accent-light)", fontWeight: 800 }}>sign in</a> to take quizzes.
            </p>
        </div>
    );

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 70px)" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }} className="animate-wiggle">🧠</div>
                <div className="spinner" style={{ margin: "0 auto 16px" }} />
                <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Loading quiz...</p>
            </div>
        </div>
    );

    if (!quiz || !quiz.questions?.length) return (
        <div style={{ textAlign: "center", padding: "120px 24px" }}>
            <p style={{ fontSize: "52px", marginBottom: "16px" }}>😕</p>
            <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 600 }}>Quiz not found.</p>
        </div>
    );

    // Study Mode: Study Phase
    if (quiz.mode === "study" && studyPhase) {
        return (
            <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
                <div className="bg-mesh" />
                <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "40px 24px 60px" }}>
                    <div className="glass-strong animate-slide-up" style={{ padding: "36px", marginBottom: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                            <div className="icon-circle icon-circle-sky">📖</div>
                            <div>
                                <h1 style={{ fontSize: "24px", fontWeight: 900 }}>{quiz.title}</h1>
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>Study Mode — Read the abstract first, then take the quiz</p>
                            </div>
                        </div>
                        <div style={{ background: "rgba(139, 92, 246, 0.07)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: "12px", padding: "16px", marginBottom: "20px", fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>
                            💡 Read through the summary below carefully. When you feel ready, click &quot;Start Quiz&quot; to test yourself.
                        </div>
                    </div>
                    <div className="glass animate-fade-in" style={{ padding: "32px", marginBottom: "32px", fontSize: "16px", lineHeight: "1.8", color: "var(--text-primary)", whiteSpace: "pre-wrap", fontWeight: 500 }}>
                        <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "var(--accent-light)" }}>📚 Topic Abstract</h2>
                        {quiz.sourceText || "No abstract available for this topic."}
                    </div>
                    <button className="btn-primary" onClick={() => setStudyPhase(false)} style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "17px" }}>
                        ✅ I&apos;ve studied — Start the Quiz! 🚀
                    </button>
                </div>
            </div>
        );
    }

    const qIndex = quiz.mode === "adaptive" && adaptiveOrder.length ? adaptiveOrder[currentQ] ?? currentQ : currentQ;
    const question = quiz.questions[qIndex];
    if (!question) return null;
    const progress = ((currentQ + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === quiz.questions.length;
    const OPTIONS = ["A", "B", "C", "D"] as const;
    const optionTexts: Record<string, string> = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD };

    const dotColors: Record<string, string> = { A: "#38BDF8", B: "#FBBF24", C: "#F87171", D: "#34D399" };

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "750px", margin: "0 auto", padding: "40px 24px 60px" }}>

                {/* Header */}
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <h1 style={{ fontSize: "20px", fontWeight: 900, marginBottom: "6px" }}>{quiz.title}</h1>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                                {quiz.mode !== "standard" && (
                                    <span className="badge" style={{ background: "rgba(139,92,246,0.15)", color: "var(--accent-light)", border: "1.5px solid rgba(139,92,246,0.3)" }}>
                                        {quiz.mode === "study" ? "📖 Study" : "🎯 Adaptive"}
                                    </span>
                                )}
                                <span style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>{answeredCount}/{quiz.questions.length} answered</span>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "32px", fontWeight: 900 }}>
                                <span className="gradient-text">{currentQ + 1}</span>
                                <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)" }}>/{quiz.questions.length}</span>
                            </div>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: elapsed > 300 ? "#F87171" : "var(--text-secondary)", marginTop: "4px", fontFamily: "monospace" }}>
                                ⏱ {formatTime(elapsed)}
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                </div>

                {/* Question Card */}
                <div className="glass-strong animate-fade-in" key={currentQ} style={{ padding: "36px", marginBottom: "20px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(139, 92, 246, 0.12)", border: "1.5px solid rgba(139, 92, 246, 0.3)", borderRadius: "999px", padding: "5px 14px", fontSize: "12px", fontWeight: 800, color: "var(--accent-light)", marginBottom: "20px" }}>
                        ❓ Question {currentQ + 1}
                    </div>
                    <p style={{ fontSize: "18px", fontWeight: 700, lineHeight: 1.6, marginBottom: "28px", color: "var(--text-primary)" }}>{question.questionText}</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {OPTIONS.map((opt) => {
                            const isSelected = answers[question.id] === opt;
                            return (
                                <button
                                    key={opt}
                                    className={`${OPT_CLASSES[opt]}${isSelected ? " selected" : ""}`}
                                    onClick={() => handleSelect(question.id, opt)}
                                    id={`option-${opt.toLowerCase()}`}
                                >
                                    <span className={BADGE_CLASSES[opt]}>{opt}</span>
                                    <span style={{ flex: 1, fontSize: "15px", fontWeight: 600 }}>{optionTexts[opt]}</span>
                                    {isSelected && <span style={{ color: dotColors[opt], fontSize: "18px" }}>●</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <button
                        className="btn-secondary"
                        onClick={handlePrev}
                        disabled={currentQ === 0}
                        style={{ opacity: currentQ === 0 ? 0.3 : 1, cursor: currentQ === 0 ? "not-allowed" : "pointer" }}
                        id="prev-btn"
                    >
                        ← Prev
                    </button>

                    {/* Dot navigator */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                        {quiz.questions.map((q, i) => {
                            const ansOpt = answers[q.id] as keyof typeof dotColors | undefined;
                            const dotColor = i === currentQ ? "var(--accent)" : ansOpt ? dotColors[ansOpt] : "rgba(255,255,255,0.15)";
                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentQ(i)}
                                    style={{ width: "10px", height: "10px", borderRadius: "50%", border: "none", cursor: "pointer", background: dotColor, transition: "all 0.2s ease", transform: i === currentQ ? "scale(1.4)" : "scale(1)", padding: 0 }}
                                    aria-label={`Go to question ${i + 1}`}
                                />
                            );
                        })}
                    </div>

                    {currentQ < quiz.questions.length - 1 ? (
                        <button className="btn-primary" onClick={handleNext} id="next-btn">Next →</button>
                    ) : (
                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting}
                            style={{ opacity: !allAnswered ? 0.5 : 1, cursor: !allAnswered ? "not-allowed" : "pointer" }}
                            id="submit-btn"
                        >
                            {submitting
                                ? <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />Submitting...</div>
                                : allAnswered
                                ? "🎉 Submit Quiz!"
                                : `Answer all (${quiz.questions.length - answeredCount} left)`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
