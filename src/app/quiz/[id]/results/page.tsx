"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/page-background";
import { GlassCardStrong, GlassCard } from "@/components/ui/glass-card";
import { 
    Trophy, 
    Sparkles, 
    LayoutDashboard, 
    Plus, 
    CheckCircle2, 
    XCircle, 
    Lightbulb,
    AlertCircle,
    ArrowRight,
    Star,
    BookOpen
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
        <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-center items-center">
            <PageBackground variant="results" />
            <div className="relative z-10 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 animate-spin rounded-full mx-auto mb-4" />
                <p className="text-sm text-[var(--text-secondary)] font-bold">Loading results...</p>
            </div>
        </div>
    );
    if (!quiz) return null;

    const total = quiz.questions.length;
    const pct = Math.round((score / total) * 100);

    const getResultColor = () => pct >= 80 ? "#34D399" : pct >= 50 ? "#FBBF24" : "#F87171";
    const getResultMsg   = () => pct >= 80 ? "Excellent work! You've mastered this material!" : pct >= 50 ? "Good effort! Review the explanations below to improve." : "Keep practicing! Read the explanations to strengthen your understanding.";
    const getCelebIcons = () => pct >= 80 ? [Sparkles, Star, Trophy, Sparkles, Star, Sparkles, Star] : pct >= 50 ? [Sparkles, Star, Sparkles, Star, Sparkles] : [BookOpen, Lightbulb, BookOpen, Lightbulb, BookOpen];

    const celebIcons = getCelebIcons();

    return (
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="results" />
            <div className="relative z-10 max-w-[800px] mx-auto px-6 py-12">

                {/* Score Card */}
                <GlassCardStrong className="p-8 md:p-12 text-center mb-8 border-white/[0.08] relative overflow-hidden" hover={false} delay={0.1}>
                    {/* Floating celebration icons using framer-motion */}
                    {celebIcons.map((Icon, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ 
                                y: [0, -15, 0],
                                opacity: [0.1, 0.25, 0.1]
                            }}
                            transition={{
                                duration: 3 + (i % 3),
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2
                            }}
                            className="absolute pointer-events-none select-none"
                            style={{
                                top: `${15 + (i * 13) % 65}%`,
                                left: `${5 + (i * 27) % 85}%`,
                            }}
                        >
                            <Icon className="w-5 h-5 text-indigo-400/40" />
                        </motion.div>
                    ))}

                    <motion.div 
                        initial={{ scale: 0.5, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="text-6xl mb-6 relative z-10 flex justify-center"
                    >
                        {pct >= 80 ? (
                            <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]" />
                        ) : pct >= 50 ? (
                            <Sparkles className="w-16 h-16 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
                        ) : (
                            <BookOpen className="w-16 h-16 text-indigo-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                        )}
                    </motion.div>

                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 relative z-10 flex items-center justify-center gap-2">
                        <span>Quiz Complete!</span>
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-semibold mb-8 relative z-10">{quiz.title}</p>

                    {/* Score display */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
                        className="inline-flex items-baseline gap-1 px-12 py-6 rounded-3xl mb-8 relative z-10"
                        style={{
                            background: `rgba(${pct >= 80 ? "52,211,153" : pct >= 50 ? "251,191,36" : "248,113,113"}, 0.08)`,
                            border: `1.5px solid ${getResultColor()}30`,
                            boxShadow: `0 8px 32px ${getResultColor()}12`,
                        }}
                    >
                        <span className="text-7xl md:text-8xl font-black leading-none" style={{ color: getResultColor() }}>{pct}</span>
                        <span className="text-2xl md:text-3xl font-extrabold" style={{ color: getResultColor() }}>%</span>
                    </motion.div>

                    <div className="text-sm text-[var(--text-secondary)] font-bold mb-4 relative z-10">
                        <strong className="text-lg" style={{ color: getResultColor() }}>{score}</strong> out of <strong className="text-lg text-[var(--text-primary)]">{total}</strong> questions correct
                    </div>

                    <div className="inline-block relative z-10">
                        <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                    </div>
                    
                    <p className="text-sm text-[var(--text-secondary)] font-bold mt-6 max-w-md mx-auto relative z-10 leading-relaxed">
                        {getResultMsg()}
                    </p>

                    <div className="flex gap-4 justify-center mt-8 flex-wrap relative z-10">
                        <Link href="/upload">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-primary flex items-center gap-1.5 px-6 py-2.5 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Quiz</span>
                            </motion.button>
                        </Link>
                        <Link href="/dashboard">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-secondary flex items-center gap-1.5 px-6 py-2.5 text-sm"
                            >
                                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                                <span>Dashboard</span>
                            </motion.button>
                        </Link>
                    </div>
                </GlassCardStrong>

                {/* Breakdown */}
                <motion.h2 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2"
                >
                    <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    <span>Question Breakdown</span>
                </motion.h2>

                <div className="flex flex-col gap-5">
                    {quiz.questions.map((q, i) => {
                        const userAnswer = answers[q.id];
                        const isCorrect = userAnswer === q.correctAnswer;
                        const OPTIONS = ["A", "B", "C", "D"] as const;
                        type OptionKey = "optionA" | "optionB" | "optionC" | "optionD";
                        const optKeys: Record<string, OptionKey> = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };

                        return (
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.4) }}
                                className="glass p-5 md:p-6 border border-white/[0.08]"
                                style={{ 
                                    borderColor: isCorrect ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)" 
                                }}
                            >
                                {/* Question header */}
                                <div className="flex gap-3.5 items-start mb-5">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                        isCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                    }`}>
                                        {isCorrect ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <XCircle className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Question {i + 1}</div>
                                        <p className="text-sm md:text-base font-bold text-[var(--text-primary)] leading-relaxed">{q.questionText}</p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="flex flex-col gap-2 mb-5 pl-1.5">
                                    {OPTIONS.map((opt) => {
                                        const isCorrectOpt = opt === q.correctAnswer;
                                        const isUserOpt    = opt === userAnswer;
                                        const optColor     = OPT_COLORS[opt];

                                        let bg          = "rgba(255,255,255,0.01)";
                                        let borderColor = "rgba(255,255,255,0.06)";
                                        let textColor   = "var(--text-secondary)";

                                        if (isCorrectOpt) { 
                                            bg = "rgba(52,211,153,0.08)";  
                                            borderColor = "rgba(52,211,153,0.3)";  
                                            textColor = "#34D399"; 
                                        } else if (isUserOpt && !isCorrect) { 
                                            bg = "rgba(248,113,113,0.08)"; 
                                            borderColor = "rgba(248,113,113,0.25)"; 
                                            textColor = "#F87171"; 
                                        }

                                        return (
                                            <div 
                                                key={opt} 
                                                className="flex items-center gap-3.5 p-3 rounded-xl border text-xs md:text-sm font-semibold transition-all"
                                                style={{ border: `1.5px solid ${borderColor}`, background: bg, color: textColor }}
                                            >
                                                <span 
                                                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                                                    style={{ 
                                                        background: `${optColor}15`, 
                                                        border: `1px solid ${optColor}35`, 
                                                        color: optColor 
                                                    }}
                                                >
                                                    {opt}
                                                </span>
                                                <span className="flex-1 text-[var(--text-primary)]/95">{q[optKeys[opt]]}</span>
                                                {isCorrectOpt && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                {isUserOpt && !isCorrectOpt && <XCircle className="w-4 h-4 text-rose-400" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed font-semibold flex items-start gap-2.5">
                                    <Lightbulb className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-indigo-300">Explanation: </strong>
                                        {q.explanation}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="flex gap-4 justify-center mt-10 flex-wrap">
                    <Link href="/upload">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-1.5 px-8 py-3.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Generate New Quiz</span>
                        </motion.button>
                    </Link>
                    <Link href="/dashboard">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-secondary flex items-center gap-1.5 px-8 py-3.5"
                        >
                            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                            <span>View Dashboard</span>
                        </motion.button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return (
        <Suspense fallback={
            <div className="relative min-h-[calc(100vh-70px)] flex flex-col justify-center items-center">
                <PageBackground variant="results" />
                <div className="relative z-10 text-center">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 animate-spin rounded-full mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-secondary)] font-bold">Loading results content...</p>
                </div>
            </div>
        }>
            <ResultsContent id={id} />
        </Suspense>
    );
}
