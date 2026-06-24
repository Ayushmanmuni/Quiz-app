"use client";

import { useEffect, useState, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/ui/page-background";
import { GlassCardStrong } from "@/components/ui/glass-card";
import { 
    Timer, 
    ArrowLeft, 
    ArrowRight, 
    Send, 
    BookOpen, 
    Brain, 
    Lock,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Check,
    Target
} from "lucide-react";

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

const OPT_CLASSES: Record<string, string> = { 
    A: "option-btn option-btn-a flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-all", 
    B: "option-btn option-btn-b flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-all", 
    C: "option-btn option-btn-c flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-all", 
    D: "option-btn option-btn-d flex items-center gap-3 w-full p-4 rounded-xl border text-left transition-all" 
};

const BADGE_CLASSES: Record<string, string> = { 
    A: "opt-badge opt-badge-a w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm", 
    B: "opt-badge opt-badge-b w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm", 
    C: "opt-badge opt-badge-c w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm", 
    D: "opt-badge opt-badge-d w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" 
};

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
    const [timeLeft, setTimeLeft] = useState(30);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const answersRef = useRef<Record<string, string>>({});

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    const formatTime = useCallback((s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    }, []);

    const timeLimit = useMemo(() => {
        if (!quiz || !quiz.questions?.length) return 30;
        const perQ = quiz.difficulty === "easy" ? 15 : quiz.difficulty === "hard" ? 60 : 30;
        return perQ * quiz.questions.length;
    }, [quiz]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting timer to derived value when quiz or study phase changes
        setTimeLeft(timeLimit);
    }, [timeLimit, studyPhase]);

    const handleSubmit = useCallback(async () => {
        if (!quiz) return;
        setSubmitting(true);
        const currentAnswers = answersRef.current;
        const score = quiz.questions.filter((q) => currentAnswers[q.id] === q.correctAnswer).length;
        const res = await fetch("/api/attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizId: quiz.id, answers: currentAnswers, score, totalQuestions: quiz.questions.length }),
        });
        setSubmitting(false);
        if (res.ok) {
            const data = await res.json();
            router.push(`/quiz/${id}/results?attempt=${data.attemptId}`);
        }
    }, [quiz, id, router]);

    // Start timer when study phase ends or quiz loads (non-study)
    useEffect(() => {
        if (!quiz || loading) return;
        if (quiz.mode === "study" && studyPhase) return;
        
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [quiz, loading, studyPhase]);

    useEffect(() => {
        if (timeLeft === 0 && quiz && !loading && !submitting) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Auto-submit is a legitimate side-effect when timer expires
            handleSubmit();
        }
    }, [timeLeft, quiz, loading, submitting, handleSubmit]);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/quiz?id=${id}`)
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return;
                // Process adaptive order outside of setState
                let newAdaptiveOrder: number[] = [];
                if (data.mode === "adaptive" && data.questions?.length) {
                    const medium: number[] = [];
                    const easy: number[] = [];
                    const hard: number[] = [];
                    data.questions.forEach((q: Question, index: number) => {
                        if (q.difficulty === "medium") medium.push(index);
                        else if (q.difficulty === "easy") easy.push(index);
                        else hard.push(index);
                    });
                    newAdaptiveOrder = [...medium, ...easy, ...hard];
                }
                // Batch state updates via React's automatic batching
                setQuiz(data);
                setLoading(false);
                if (newAdaptiveOrder.length > 0) setAdaptiveOrder(newAdaptiveOrder);
                if (data.mode !== "study") setStudyPhase(false);
            })
            .catch(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    const handleSelect = (questionId: string, option: string) => {
        if (studyPhase) return;
        setAnswers((prev) => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => { if (currentQ < (quiz?.questions.length ?? 0) - 1) setCurrentQ((prev) => prev + 1); };
    const handlePrev = () => { if (currentQ > 0) setCurrentQ((prev) => prev - 1); };

    if (!session) return (
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="quiz" />
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-70px)] text-center px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6 text-indigo-400"
                >
                    <Lock className="w-10 h-10 animate-pulse" />
                </motion.div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
                <p className="text-sm text-[var(--text-secondary)] font-semibold max-w-sm mb-6">
                    Please sign in to take this quiz.
                </p>
                <a href="/login" className="btn-primary flex items-center gap-2">
                    Sign In Now <ArrowRight className="w-4 h-4" />
                </a>
            </div>
        </div>
    );

    if (loading) return (
        <div className="relative min-h-[calc(100vh-70px)] flex justify-center items-center flex-col">
            <PageBackground variant="quiz" />
            <div className="relative z-10 text-center px-6 py-12">
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6 text-indigo-400"
                >
                    <Brain className="w-8 h-8 animate-pulse" />
                </motion.div>
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 animate-spin rounded-full mx-auto mb-4" />
                <p className="text-sm text-[var(--text-secondary)] font-bold">Loading quiz questions...</p>
            </div>
        </div>
    );

    if (!quiz || !quiz.questions?.length) return (
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="quiz" />
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-70px)] text-center px-6 py-12">
                <AlertCircle className="w-16 h-16 text-indigo-400/85 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Quiz Not Found</h2>
                <p className="text-sm text-[var(--text-secondary)] font-semibold">The quiz you are looking for does not exist or has been deleted.</p>
            </div>
        </div>
    );

    // Study Mode: Study Phase
    if (quiz.mode === "study" && studyPhase) {
        return (
            <div className="relative min-h-[calc(100vh-70px)]">
                <PageBackground variant="quiz" />
                <div className="relative z-10 max-w-[800px] mx-auto px-6 py-12">
                    <GlassCardStrong className="p-6 md:p-8 mb-6 border-white/[0.08]" hover={false} delay={0.1}>
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6 text-center md:text-left">
                            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-[var(--text-primary)]">{quiz.title}</h1>
                                <p className="text-xs text-[var(--text-secondary)] font-semibold mt-1 uppercase tracking-wider">
                                    Study Mode — Read the abstract, then take the quiz
                                </p>
                            </div>
                        </div>
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-xs md:text-sm text-[var(--text-secondary)] font-bold flex items-start gap-2.5">
                            <Sparkles className="w-5 h-5 text-indigo-300 flex-shrink-0 animate-pulse" />
                            <span>Read through the summary below carefully. When you feel ready, click &quot;Start Quiz&quot; to test your knowledge.</span>
                        </div>
                    </GlassCardStrong>

                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-6 md:p-10 mb-8 text-sm md:text-base leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap font-medium border-white/[0.08]"
                    >
                        <h2 className="text-lg font-extrabold mb-4 text-indigo-300 flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            <span>Topic Abstract</span>
                        </h2>
                        {quiz.sourceText || "No abstract available for this topic."}
                    </motion.div>

                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button" 
                        className="btn-primary w-full justify-center py-4 flex items-center gap-2 text-base font-bold shadow-lg shadow-indigo-500/20" 
                        onClick={() => setStudyPhase(false)}
                    >
                        <span>Start the Quiz!</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
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
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="quiz" />
            <div className="relative z-10 max-w-[750px] mx-auto px-6 py-12">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 gap-4 text-center md:text-left">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mb-2">{quiz.title}</h1>
                            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                                {quiz.mode !== "standard" && (
                                    <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                                        {quiz.mode === "study" ? (
                                            <>
                                                <BookOpen className="w-3 h-3" />
                                                <span>Study</span>
                                            </>
                                        ) : (
                                            <>
                                                <Target className="w-3 h-3" />
                                                <span>Adaptive</span>
                                            </>
                                        )}
                                    </span>
                                )}
                                <span className="text-xs text-[var(--text-secondary)] font-bold ml-1">
                                    {answeredCount}/{quiz.questions.length} answered
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-1.5">
                            <div className="text-2xl md:text-3xl font-black">
                                <span className="gradient-text">{currentQ + 1}</span>
                                <span className="text-sm md:text-base font-semibold text-[var(--text-secondary)]">/{quiz.questions.length}</span>
                            </div>
                            <div 
                                className={`flex items-center gap-1.5 text-sm font-bold transition-all duration-200 ${
                                    timeLeft <= 15 ? "text-rose-400 animate-pulse scale-105" : "text-[var(--text-secondary)]"
                                }`}
                                style={{ fontFamily: "monospace" }}
                            >
                                <Timer className="w-4 h-4" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Animate Progress Bar width changes */}
                    <div className="progress-bar h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="progress-fill h-full bg-gradient-to-r from-violet-500 to-rose-500" 
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {/* Question Card with Animation on Change */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <GlassCardStrong className="p-6 md:p-8 mb-6 border-white/[0.08]" hover={false}>
                            <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1 text-[11px] font-bold text-indigo-300 mb-6 uppercase tracking-wider">
                                Question {currentQ + 1}
                            </div>
                            <p className="text-base md:text-lg font-bold leading-relaxed mb-6 text-[var(--text-primary)]">{question.questionText}</p>

                            <div className="flex flex-col gap-3">
                                {OPTIONS.map((opt) => {
                                    const isSelected = answers[question.id] === opt;
                                    return (
                                        <motion.button
                                            key={opt}
                                            type="button"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className={`${OPT_CLASSES[opt]} ${isSelected ? "selected shadow-md border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--text-primary)]" : "border-[var(--border-color)] hover:border-[var(--border-glow)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                                            onClick={() => handleSelect(question.id, opt)}
                                            id={`option-${opt.toLowerCase()}`}
                                            aria-pressed={isSelected}
                                        >
                                            <span className={`${BADGE_CLASSES[opt]} flex-shrink-0`}>{opt}</span>
                                            <span className="flex-1 text-sm font-semibold text-[var(--text-primary)]/90">{optionTexts[opt]}</span>
                                            {isSelected && (
                                                <motion.span 
                                                    layoutId="selected-dot"
                                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: dotColors[opt] }}
                                                />
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </GlassCardStrong>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between items-center gap-4 mt-8 flex-wrap">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold"
                        type="button"
                        onClick={handlePrev}
                        disabled={currentQ === 0}
                        style={{ opacity: currentQ === 0 ? 0.3 : 1, cursor: currentQ === 0 ? "not-allowed" : "pointer" }}
                        id="prev-btn"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Prev</span>
                    </motion.button>

                    {/* Dot navigator */}
                    <div className="flex gap-2 flex-wrap justify-center max-w-[200px] md:max-w-none">
                        {quiz.questions.map((q, i) => {
                            const ansOpt = answers[q.id] as keyof typeof dotColors | undefined;
                            const dotColor = i === currentQ ? "var(--accent)" : ansOpt ? dotColors[ansOpt] : "rgba(255,255,255,0.15)";
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setCurrentQ(i)}
                                    style={{ 
                                        width: "8px", 
                                        height: "8px", 
                                        borderRadius: "50%", 
                                        border: "none", 
                                        cursor: "pointer", 
                                        background: dotColor, 
                                        transform: i === currentQ ? "scale(1.3)" : "scale(1)" 
                                    }}
                                    className="transition-all duration-200 p-0"
                                    aria-label={`Go to question ${i + 1}`}
                                    aria-current={i === currentQ ? "step" : undefined}
                                />
                            );
                        })}
                    </div>

                    {currentQ < quiz.questions.length - 1 ? (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold" 
                            type="button" 
                            onClick={handleNext} 
                            id="next-btn"
                        >
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold"
                            type="button"
                            onClick={handleSubmit}
                            disabled={!allAnswered || submitting}
                            style={{ opacity: !allAnswered ? 0.5 : 1, cursor: !allAnswered ? "not-allowed" : "pointer" }}
                            id="submit-btn"
                        >
                            {submitting ? (
                                <>
                                    <div className="spinner w-3.5 h-3.5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                    <span>Submitting...</span>
                                </>
                            ) : allAnswered ? (
                                <>
                                    <Sparkles className="w-4 h-4 animate-pulse" />
                                    <span>Submit Quiz!</span>
                                </>
                            ) : (
                                <span>Answer all questions ({quiz.questions.length - answeredCount} left)</span>
                            )}
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
