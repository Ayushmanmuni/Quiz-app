"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { PageBackground } from "@/components/ui/page-background";
import { GlassCardStrong } from "@/components/ui/glass-card";
import { 
    FileText, 
    UploadCloud, 
    Sparkles, 
    Brain, 
    BookOpen, 
    Target, 
    Sliders, 
    AlertTriangle,
    CheckCircle2,
    Lock,
    Settings,
    FileUp,
    HelpCircle,
    ArrowRight,
    Zap
} from "lucide-react";

const DIFFICULTIES = [
    { value: "easy",   label: "Easy",   desc: "Factual recall",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.3)",  color: "#34D399" },
    { value: "medium", label: "Medium", desc: "Comprehension",   bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.3)",  color: "#FBBF24" },
    { value: "hard",   label: "Hard",   desc: "Analysis",        bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.3)", color: "#F87171" },
] as const;

const MODES = [
    { value: "standard", label: "Standard", icon: <HelpCircle className="w-5 h-5" />, desc: "Classic quiz format",       bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.3)",  color: "#A78BFA" },
    { value: "study",    label: "Study",    icon: <BookOpen className="w-5 h-5" />, desc: "Learn first, quiz after",   bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.3)",  color: "#38BDF8" },
    { value: "adaptive", label: "Adaptive", icon: <Target className="w-5 h-5" />, desc: "Difficulty adjusts to you", bg: "rgba(236,72,153,0.08)",  border: "rgba(236,72,153,0.3)",  color: "#EC4899" },
] as const;

export default function UploadPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [text, setText]                   = useState("");
    const [title, setTitle]                 = useState("");
    const [topic, setTopic]                 = useState("");
    const [difficulty, setDifficulty]       = useState(() => {
        if (typeof window === "undefined") return "medium";
        try {
            const stored = window.localStorage.getItem("quizai_difficulty");
            if (!stored) return "medium";
            const parsed = JSON.parse(stored) as string;
            if (["easy", "medium", "hard"].includes(parsed)) return parsed;
        } catch { /* ignore */ }
        return "medium";
    });
    const [mode, setMode]                   = useState("standard");
    const [numQuestions, setNumQuestions]   = useState(10);
    const [loading, setLoading]             = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError]                 = useState("");
    const [activeTab, setActiveTab]         = useState<"paste" | "upload" | "topic">("paste");
    const [fileName, setFileName]           = useState("");
    const [isDragOver, setIsDragOver]       = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFileZoneKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fileRef.current?.click();
        }
    };

    useEffect(() => {
        try { window.localStorage.setItem("quizai_difficulty", JSON.stringify(difficulty)); } catch { /* ignore */ }
    }, [difficulty]);

    const handleFileUpload = async (file: File) => {
        setUploadLoading(true);
        setError("");
        const formData = new FormData();
        formData.append("file", file);
        const res  = await fetch("/api/quiz", { method: "POST", body: formData });
        const data = await res.json();
        setUploadLoading(false);
        if (!res.ok) { setError(data.error || "Failed to process file"); }
        else { setText(data.text); setFileName(file.name); }
    };

    const handleGenerate = async () => {
        if (activeTab === "topic") {
            if (!topic.trim() || topic.trim().length < 3) { setError("Please enter a topic (at least 3 characters)."); return; }
        } else {
            if (!text.trim() || text.trim().length < 100) { setError("Please provide at least 100 characters of text."); return; }
        }
        setError("");
        setLoading(true);
        const body: Record<string, unknown> = {
            difficulty, numQuestions, mode,
            title: title || (activeTab === "topic" ? `${topic} Quiz` : `Quiz – ${new Date().toLocaleDateString("en-IN")}`),
        };
        if (activeTab === "topic") { body.topic = topic; body.source = "topic"; }
        else { body.text = text; body.source = activeTab === "upload" ? "file" : "text"; }
        const res  = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        if (!res.ok) { setLoading(false); setError(data.error || "Failed to generate quiz"); }
        else { router.push(`/quiz/${data.quizId}`); }
    };

    if (!session) {
        return (
            <div className="relative min-h-[calc(100vh-70px)]">
                <PageBackground variant="create" />
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
                        Please sign in to generate and customize your AI-powered quizzes.
                    </p>
                    <a href="/login" className="btn-primary flex items-center gap-2">
                        Sign In Now <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        );
    }

    const tabs = [
        { key: "paste"  as const, label: "Paste Text", icon: <FileText className="w-4 h-4" /> },
        { key: "upload" as const, label: "Upload File", icon: <UploadCloud className="w-4 h-4" /> },
        { key: "topic"  as const, label: "Enter Topic", icon: <Brain className="w-4 h-4" /> },
    ];

    if (loading) {
        return (
            <div className="relative min-h-[calc(100vh-70px)] flex justify-center items-center flex-col">
                <PageBackground variant="create" />
                <div className="relative z-10 text-center px-6 py-12 max-w-lg">
                    <motion.div 
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500/20 to-rose-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-violet-500/10"
                    >
                        {activeTab === "topic" ? (
                            <Brain className="w-10 h-10 text-violet-400" />
                        ) : (
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        )}
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-black mb-4 gradient-text">
                        Generating Your Quiz...
                    </h2>
                    <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-400 animate-spin rounded-full mx-auto mb-8" />
                    <p className="text-sm text-[var(--text-secondary)] font-bold leading-relaxed">
                        {activeTab === "topic"
                            ? `AI is researching "${topic}", writing educational content, and crafting ${numQuestions} perfect questions. This usually takes 10–30 seconds.`
                            : `Hugging Face AI is analyzing your content and crafting ${numQuestions} perfect questions. This usually takes 10–30 seconds.`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="create" />
            <div className="relative z-10 max-w-[800px] mx-auto px-6 py-12">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10 text-center md:text-left"
                >
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 flex items-center justify-center md:justify-start gap-2">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                        <span>Generate New Quiz</span>
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] font-semibold flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
                        <span>Paste text, upload a file, or just enter a topic — AI does the rest</span>
                        <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </p>
                </motion.div>

                <GlassCardStrong className="p-6 md:p-10 border-white/[0.08]" hover={false} delay={0.1}>
                    {/* Title */}
                    <div className="mb-6">
                        <label htmlFor="quiz-title" className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                            Quiz Title (optional)
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. CBSE Physics Chapter 5"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            id="quiz-title"
                        />
                    </div>

                    {/* Source Tabs */}
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2.5 uppercase tracking-wider">
                            Quiz Source
                        </label>
                        <div role="tablist" aria-label="Quiz source" className="flex flex-wrap gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1.5 w-fit">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    id={`${tab.key}-tab`}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab.key}
                                    aria-controls={`${tab.key}-panel`}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                                        activeTab === tab.key 
                                            ? "bg-gradient-to-r from-violet-500/20 to-rose-500/20 border border-violet-500/30 text-indigo-300 shadow-md shadow-violet-500/5" 
                                            : "border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Paste Text */}
                    {activeTab === "paste" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            id="paste-panel" 
                            role="tabpanel" 
                            aria-labelledby="paste-tab" 
                            className="mb-8"
                        >
                            <label htmlFor="content-text" className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Your Content</label>
                            <textarea
                                className="input-field"
                                placeholder="Paste your text, notes, article... (minimum 100 characters)"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={10}
                                style={{ resize: "vertical", lineHeight: "1.6" }}
                                id="content-text"
                            />
                            <div className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${text.length < 100 ? "text-rose-400" : "text-emerald-400"}`}>
                                {text.length < 100 ? (
                                    <span>{text.length} characters (need {100 - text.length} more)</span>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{text.length} characters — Ready!</span>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Upload File */}
                    {activeTab === "upload" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            id="upload-panel" 
                            role="tabpanel" 
                            aria-labelledby="upload-tab" 
                            className="mb-8"
                        >
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                accept=".txt,.pdf,.md"
                                className="hidden"
                                id="file-input"
                            />
                            <motion.div
                                role="button"
                                tabIndex={0}
                                aria-label="Upload a text, PDF, or markdown file"
                                onClick={() => fileRef.current?.click()}
                                onKeyDown={handleFileZoneKeyDown}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                                animate={{ 
                                    borderColor: isDragOver ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.08)",
                                    backgroundColor: isDragOver ? "rgba(139,92,246,0.05)" : "rgba(255,255,255,0.02)"
                                }}
                                className="border border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-colors duration-200"
                            >
                                {uploadLoading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <FileUp className="w-10 h-10 text-indigo-400 animate-bounce" />
                                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 animate-spin rounded-full" />
                                        <p className="text-sm text-[var(--text-secondary)] font-semibold">Extracting text...</p>
                                    </div>
                                ) : fileName ? (
                                    <div className="flex flex-col items-center">
                                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                                        <p className="font-extrabold text-[var(--text-primary)] text-base mb-1">{fileName}</p>
                                        <p className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                            <span>{text.length} characters extracted</span>
                                            <Sparkles className="w-3 h-3 text-indigo-400" />
                                        </p>
                                        <p className="text-[var(--text-secondary)] text-xs mt-4 font-semibold">Click or drag another file to change</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className="w-12 h-12 text-indigo-400/80 mb-3 animate-pulse" />
                                        <p className="font-extrabold text-[var(--text-primary)] text-base mb-1">Drag & drop your file here</p>
                                        <p className="text-[var(--text-secondary)] text-sm font-semibold">or click to browse local files</p>
                                        <p className="text-[var(--text-secondary)] text-xs mt-4 opacity-50 font-bold">Supports PDF, TXT, MD</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Topic */}
                    {activeTab === "topic" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            id="topic-panel" 
                            role="tabpanel" 
                            aria-labelledby="topic-tab" 
                            className="mb-8"
                        >
                            <label htmlFor="topic-input" className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Topic</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Photosynthesis, World War II, Machine Learning..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                id="topic-input"
                            />
                            <p className="mt-2.5 text-xs text-[var(--text-secondary)] font-semibold leading-relaxed flex items-center gap-1.5 flex-wrap">
                                <span>AI will generate content about this topic and create a quiz from it — no text needed!</span>
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            </p>
                        </motion.div>
                    )}

                    <div className="divider my-6 border-t border-white/[0.08]" />

                    {/* Quiz Mode */}
                    <div className="mb-6">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                            <Settings className="w-4 h-4 text-indigo-400" />
                            <span>Quiz Mode</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {MODES.map((m) => {
                                const isActive = mode === m.value;
                                return (
                                    <motion.button
                                        key={m.value}
                                        type="button"
                                        aria-pressed={isActive}
                                        onClick={() => setMode(m.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`p-5 rounded-2xl border text-left flex flex-col items-start transition-all ${
                                            isActive 
                                                ? "bg-[var(--accent-glow)] text-[var(--text-primary)]" 
                                                : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)]"
                                        }`}
                                        style={{
                                            borderColor: isActive ? m.color : "rgba(255,255,255,0.06)",
                                            boxShadow: isActive ? `0 0 20px ${m.color}15` : "none"
                                        }}
                                    >
                                        <div className="p-2 rounded-xl mb-3 flex items-center justify-center" style={{ background: isActive ? m.bg : "rgba(255,255,255,0.03)", color: isActive ? m.color : "inherit" }}>
                                            {m.icon}
                                        </div>
                                        <div className="fontWeight-extrabold text-sm mb-1">{m.label}</div>
                                        <div className="text-[11px] font-semibold leading-relaxed opacity-85">{m.desc}</div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Difficulty */}
                    {mode !== "adaptive" && (
                        <div className="mb-6">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                                <Sliders className="w-4 h-4 text-indigo-400" />
                                <span>Difficulty Level</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {DIFFICULTIES.map((d) => {
                                    const isActive = difficulty === d.value;
                                    return (
                                        <motion.button
                                            key={d.value}
                                            type="button"
                                            aria-pressed={isActive}
                                            onClick={() => setDifficulty(d.value)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`p-4 rounded-2xl border text-left flex flex-col transition-all ${
                                                isActive 
                                                    ? "bg-[var(--accent-glow)] text-[var(--text-primary)]" 
                                                    : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-glow)]"
                                            }`}
                                            style={{
                                                borderColor: isActive ? d.color : "rgba(255,255,255,0.06)",
                                                boxShadow: isActive ? `0 0 20px ${d.color}15` : "none"
                                            }}
                                        >
                                            <div className="fontWeight-extrabold text-sm mb-1" style={{ color: isActive ? d.color : "inherit" }}>{d.label}</div>
                                            <div className="text-[11px] font-semibold leading-relaxed opacity-85">{d.desc}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Question Count */}
                    <div className="mb-8">
                        <label className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                                <Sliders className="w-4 h-4 text-indigo-400" />
                                <span>Number of Questions</span>
                            </span>
                            <span className="bg-gradient-to-r from-violet-500 to-rose-500 text-white rounded-full px-3.5 py-1 font-black text-sm shadow-md shadow-violet-500/10">
                                {numQuestions}
                            </span>
                        </label>
                        <input
                            type="range"
                            min={5}
                            max={20}
                            step={1}
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                            id="num-questions"
                        />
                        <div className="flex justify-between text-[11px] text-[var(--text-secondary)] mt-2 font-bold">
                            <span className="flex items-center gap-1">5 — Quick <Zap className="w-3 h-3 text-amber-400" /></span>
                            <span className="flex items-center gap-1">20 — Comprehensive <BookOpen className="w-3 h-3 text-indigo-400" /></span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 text-sm text-rose-400 flex items-start gap-2.5 font-semibold"
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Generate Button */}
                    <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleGenerate}
                        className="btn-primary w-full justify-center py-4 flex items-center gap-2 text-base font-bold shadow-lg shadow-indigo-500/20"
                        id="generate-btn"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Generate {numQuestions} Questions</span>
                    </motion.button>
                </GlassCardStrong>
            </div>
        </div>
    );
}
