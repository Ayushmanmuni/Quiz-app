"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/page-background";
import { GlassCard, GlassCardStrong } from "@/components/ui/glass-card";
import { 
    Plus, 
    FileText, 
    TrendingUp, 
    Trophy, 
    Calendar, 
    RotateCcw, 
    Sparkles, 
    ArrowRight, 
    Clock, 
    AlertCircle, 
    BookOpen, 
    Target,
    Activity
} from "lucide-react";

interface Attempt {
    id: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
    quiz: { title: string; difficulty: string; mode?: string };
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
            <div className="relative min-h-[calc(100vh-70px)] flex justify-center items-center flex-col">
                <PageBackground variant="dashboard" />
                <div className="relative z-10 text-center px-6">
                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-400 animate-spin rounded-full mx-auto mb-4" />
                    <p className="text-sm text-[var(--text-secondary)] font-bold">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const avgScore  = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalQuestions) * 100, 0) / attempts.length) : 0;
    const bestScore = attempts.length ? Math.max(...attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100))) : 0;
    const thisWeek  = attempts.filter((a) => (new Date().getTime() - new Date(a.completedAt).getTime()) / (1000 * 60 * 60 * 24) <= 7).length;

    const stats = [
        { label: "Total Quizzes",   value: attempts.length, icon: <FileText className="w-5 h-5" />, color: "rgba(139,92,246,", textCol: "text-violet-400", borderCol: "border-violet-500/20" },
        { label: "Avg Score",       value: `${avgScore}%`,  icon: <TrendingUp className="w-5 h-5" />, color: "rgba(56,189,248,", textCol: "text-sky-400", borderCol: "border-sky-500/20" },
        { label: "Best Score",      value: `${bestScore}%`, icon: <Trophy className="w-5 h-5" />, color: "rgba(251,191,36,", textCol: "text-amber-400", borderCol: "border-amber-500/20" },
        { label: "This Week",       value: thisWeek,        icon: <Activity className="w-5 h-5" />, color: "rgba(248,113,113,", textCol: "text-rose-400", borderCol: "border-rose-500/20" },
    ];

    const getScoreKey = (pct: number) => pct >= 80 ? "high" : pct >= 50 ? "medium" : "low";
    const formatDate  = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    return (
        <main className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="dashboard" />
            <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-10 gap-6 text-center md:text-left">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mb-2">
                            Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)] font-semibold">Track your quiz progress and start new challenges.</p>
                    </div>
                    <Link href="/upload">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 px-6 py-3"
                            aria-label="Create a new quiz"
                        >
                            <Plus className="w-4.5 h-4.5" />
                            <span>New Quiz</span>
                        </motion.button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <section aria-label="Quiz statistics" className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="h-full"
                            >
                                <GlassCard 
                                    className={`p-5 flex flex-col h-full border ${s.borderCol}`} 
                                    hover={true}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                        style={{ 
                                            background: `${s.color}0.12)`, 
                                            border: `1.5px solid ${s.color}0.25)` 
                                        }}
                                        aria-hidden="true"
                                    >
                                        <div className={s.textCol}>{s.icon}</div>
                                    </div>
                                    <div className={`text-2xl md:text-3xl font-black mb-1`} style={{ color: `${s.color}0.95)` }}>
                                        {s.value}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] font-bold">{s.label}</div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Recent Quizzes */}
                <section aria-label="Recent quizzes">
                    <h2 className="text-lg md:text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span>Recent Quizzes</span>
                    </h2>

                    {attempts.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <GlassCardStrong className="p-8 md:p-12 text-center border-white/[0.08]" hover={false}>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6 text-indigo-400"
                                    aria-hidden="true"
                                >
                                    <Sparkles className="w-10 h-10" />
                                </motion.div>
                                <h3 className="text-xl font-extrabold text-[var(--text-primary)] mb-2">No quizzes taken yet!</h3>
                                <p className="text-sm text-[var(--text-secondary)] font-semibold mb-8 max-w-sm mx-auto">
                                    Generate your first AI-powered quiz from any document, topic, or text. It&apos;s free!
                                </p>
                                <Link href="/upload">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="btn-primary flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 px-8 py-3.5 mx-auto"
                                        aria-label="Generate your first quiz"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Generate First Quiz</span>
                                    </motion.button>
                                </Link>
                            </GlassCardStrong>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {attempts.map((attempt, index) => {
                                const pct      = Math.round((attempt.score / attempt.totalQuestions) * 100);
                                const scoreKey = getScoreKey(pct);
                                const color    = SCORE_COLORS[scoreKey];
                                return (
                                    <motion.div
                                        key={attempt.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4) }}
                                    >
                                        <GlassCard
                                            className="p-5 flex flex-col md:flex-row items-center md:justify-between gap-5 border-white/[0.08]"
                                            hover={true}
                                        >
                                            <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
                                                {/* Score ring */}
                                                <div
                                                    className="w-14 h-14 rounded-full flex items-center justify-center relative flex-shrink-0"
                                                    style={{
                                                        background: `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.06) 0)`,
                                                    }}
                                                    role="img"
                                                    aria-label={`Score: ${pct}%`}
                                                >
                                                    <div className="absolute inset-[4px] rounded-full bg-[var(--bg-secondary)] flex items-center justify-center font-black text-xs" style={{ color }}>
                                                        {pct}%
                                                    </div>
                                                </div>
                                                <div className="text-center md:text-left flex-1 min-w-[200px]">
                                                    <div className="font-extrabold text-[var(--text-primary)] text-base mb-1.5 leading-snug">
                                                        {attempt.quiz.title}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
                                                        <span className={`badge badge-${attempt.quiz.difficulty}`}>
                                                            {attempt.quiz.difficulty}
                                                        </span>
                                                        {attempt.quiz.mode && attempt.quiz.mode !== "standard" && (
                                                            <span className="badge bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 inline-flex items-center gap-1">
                                                                {attempt.quiz.mode === "study" ? (
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
                                                        <span className="text-xs text-[var(--text-secondary)] font-bold">
                                                            {attempt.score}/{attempt.totalQuestions} correct
                                                        </span>
                                                        <span
                                                            className="text-xs text-[var(--text-secondary)] opacity-60 font-semibold"
                                                            title={new Date(attempt.completedAt).toLocaleString()}
                                                        >
                                                            • {formatDate(attempt.completedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2.5 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                                <Link href={`/quiz/${attempt.quizId}/results?attempt=${attempt.id}`} className="flex-1 md:flex-none">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="btn-secondary w-full px-5 py-2 text-xs font-bold"
                                                        aria-label={`Review ${attempt.quiz.title}`}
                                                    >
                                                        Review
                                                    </motion.button>
                                                </Link>
                                                <Link href={`/quiz/${attempt.quizId}`} className="flex-1 md:flex-none">
                                                    <motion.button 
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="btn-primary w-full px-5 py-2 text-xs font-bold flex items-center justify-center gap-1"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Retake</span>
                                                    </motion.button>
                                                </Link>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
