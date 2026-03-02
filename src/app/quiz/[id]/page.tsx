"use client";

import { useEffect, useState, use } from "react";
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
    order: number;
}

interface Quiz {
    id: string;
    title: string;
    difficulty: string;
    questions: Question[];
}

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`/api/quiz?id=${id}`)
            .then((r) => r.json())
            .then((data) => { setQuiz(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const handleSelect = (questionId: string, option: string) => {
        if (submitted) return;
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

    if (!session) {
        return (
            <div style={{ textAlign: "center", padding: "120px 24px" }}>
                <p style={{ color: "rgba(175,175,210,0.7)" }}>Please <a href="/login" style={{ color: "#6b8cff" }}>sign in</a> to take quizzes.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 72px)" }}>
                <div style={{ textAlign: "center" }}>
                    <div className="spinner" style={{ margin: "0 auto 16px" }} />
                    <p style={{ color: "rgba(175,175,210,0.7)" }}>Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions?.length) {
        return (
            <div style={{ textAlign: "center", padding: "120px 24px" }}>
                <p style={{ fontSize: "48px", marginBottom: "16px" }}>😕</p>
                <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "16px" }}>Quiz not found.</p>
            </div>
        );
    }

    const question = quiz.questions[currentQ];
    const progress = ((currentQ + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === quiz.questions.length;
    const OPTIONS = ["A", "B", "C", "D"] as const;
    const optionTexts: Record<string, string> = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD };

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "750px", margin: "0 auto", padding: "40px 24px 60px" }}>
                <div style={{ marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                            <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>{quiz.title}</h1>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                                <span style={{ color: "rgba(175,175,210,0.5)", fontSize: "13px" }}>{answeredCount}/{quiz.questions.length} answered</span>
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#6b8cff" }}>
                                {currentQ + 1}<span style={{ fontSize: "16px", fontWeight: 400, color: "rgba(175,175,210,0.5)" }}>/{quiz.questions.length}</span>
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                </div>

                <div className="glass-strong animate-fade-in" key={currentQ} style={{ padding: "36px", marginBottom: "20px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(79, 110, 247, 0.1)", border: "1px solid rgba(79, 110, 247, 0.25)", borderRadius: "8px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, color: "#6b8cff", marginBottom: "20px" }}>Question {currentQ + 1}</div>
                    <p style={{ fontSize: "18px", fontWeight: 600, lineHeight: 1.6, marginBottom: "28px", color: "#f0f0ff" }}>{question.questionText}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {OPTIONS.map((opt) => {
                            const isSelected = answers[question.id] === opt;
                            return (
                                <button key={opt} className={`option-btn${isSelected ? " selected" : ""}`} onClick={() => handleSelect(question.id, opt)} id={`option-${opt.toLowerCase()}`}>
                                    <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: isSelected ? "rgba(79, 110, 247, 0.3)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0, border: isSelected ? "1px solid rgba(79, 110, 247, 0.5)" : "1px solid rgba(255,255,255,0.08)", color: isSelected ? "#6b8cff" : "rgba(175,175,210,0.7)" }}>{opt}</span>
                                    <span style={{ flex: 1, fontSize: "15px" }}>{optionTexts[opt]}</span>
                                    {isSelected && <span style={{ color: "#6b8cff" }}>●</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <button className="btn-secondary" onClick={handlePrev} disabled={currentQ === 0} style={{ opacity: currentQ === 0 ? 0.3 : 1, cursor: currentQ === 0 ? "not-allowed" : "pointer" }} id="prev-btn">← Previous</button>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                        {quiz.questions.map((q, i) => (
                            <button key={i} onClick={() => setCurrentQ(i)} style={{ width: "10px", height: "10px", borderRadius: "50%", border: "none", cursor: "pointer", background: i === currentQ ? "#4f6ef7" : answers[q.id] ? "rgba(16, 217, 138, 0.6)" : "rgba(255,255,255,0.12)", transition: "all 0.2s ease", transform: i === currentQ ? "scale(1.3)" : "scale(1)" }} />
                        ))}
                    </div>
                    {currentQ < quiz.questions.length - 1 ? (
                        <button className="btn-primary" onClick={handleNext} id="next-btn">Next →</button>
                    ) : (
                        <button className="btn-primary" onClick={handleSubmit} disabled={!allAnswered || submitting} style={{ opacity: !allAnswered ? 0.5 : 1, cursor: !allAnswered ? "not-allowed" : "pointer" }} id="submit-btn">
                            {submitting ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />Submitting...
                                </div>
                            ) : allAnswered ? "Submit Quiz ✓" : `Answer all (${quiz.questions.length - answeredCount} left)`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
