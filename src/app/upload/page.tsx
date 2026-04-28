"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DIFFICULTIES = [
    { value: "easy",   label: "Easy",   icon: "🌱", desc: "Factual recall",  bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.45)",  color: "#34D399" },
    { value: "medium", label: "Medium", icon: "🔥", desc: "Comprehension",   bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.45)",  color: "#FBBF24" },
    { value: "hard",   label: "Hard",   icon: "⚡", desc: "Analysis",        bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.45)", color: "#F87171" },
] as const;

const MODES = [
    { value: "standard", label: "Standard", icon: "📝", desc: "Classic quiz format",       bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.45)",  color: "#A78BFA" },
    { value: "study",    label: "Study",    icon: "📖", desc: "Learn first, quiz after",   bg: "rgba(56,189,248,0.12)",  border: "rgba(56,189,248,0.45)",  color: "#38BDF8" },
    { value: "adaptive", label: "Adaptive", icon: "🎯", desc: "Difficulty adjusts to you", bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.45)",  color: "#EC4899" },
] as const;

export default function UploadPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [text, setText]                   = useState("");
    const [title, setTitle]                 = useState("");
    const [topic, setTopic]                 = useState("");
    const [difficulty, setDifficulty]       = useState("medium");
    const [mode, setMode]                   = useState("standard");
    const [numQuestions, setNumQuestions]   = useState(10);
    const [loading, setLoading]             = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError]                 = useState("");
    const [activeTab, setActiveTab]         = useState<"paste" | "upload" | "topic">("paste");
    const [fileName, setFileName]           = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem("quizai_difficulty");
            if (!stored) return;
            const parsed = JSON.parse(stored) as string;
            if (["easy", "medium", "hard"].includes(parsed)) setDifficulty(parsed);
        } catch { /* ignore */ }
    }, []);

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
            <div style={{ textAlign: "center", padding: "120px 24px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }} className="animate-float">🔐</div>
                <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 700 }}>
                    Please <a href="/login" style={{ color: "var(--accent-light)", fontWeight: 800 }}>sign in</a> to generate a quiz.
                </p>
            </div>
        );
    }

    const tabs = [
        { key: "paste"  as const, label: "✏️ Paste Text" },
        { key: "upload" as const, label: "📁 Upload File" },
        { key: "topic"  as const, label: "💡 Enter Topic" },
    ];

    if (loading) {
        return (
            <div style={{ position: "relative", minHeight: "calc(100vh - 70px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                <div className="bg-mesh" />
                <div className="animate-slide-up" style={{ zIndex: 1, textAlign: "center", padding: "20px" }}>
                    <div style={{ fontSize: "72px", marginBottom: "24px" }} className="animate-float">
                        {activeTab === "topic" ? "🧠" : "🤖"}
                    </div>
                    <h2 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "16px" }} className="gradient-text">
                        Generating Your Quiz...
                    </h2>
                    <div className="spinner" style={{ margin: "0 auto 28px", width: "48px", height: "48px", borderWidth: "4px" }} />
                    <p style={{ color: "var(--text-secondary)", fontSize: "16px", fontWeight: 700, maxWidth: "450px", margin: "0 auto", lineHeight: 1.6 }}>
                        {activeTab === "topic"
                            ? `AI is researching "${topic}", writing educational content, and crafting ${numQuestions} perfect questions. This usually takes 10–30 seconds.`
                            : `Hugging Face AI is analyzing your content and crafting ${numQuestions} perfect questions. This usually takes 10–30 seconds.`}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "50px 24px" }}>

                <div className="animate-slide-up">
                    <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}>✨ Generate New Quiz</h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "15px", fontWeight: 600 }}>
                        Paste text, upload a file, or just enter a topic — AI does the rest 🧠
                    </p>
                </div>

                <div className="glass-strong animate-slide-up" style={{ padding: "36px" }}>

                    {/* Title */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>
                            Quiz Title (optional)
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. CBSE Physics Chapter 5 🔬"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            id="quiz-title"
                        />
                    </div>

                    {/* Source Tabs */}
                    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "999px", padding: "4px", marginBottom: "24px", width: "fit-content" }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                style={{
                                    background: activeTab === tab.key ? "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(236,72,153,0.15))" : "transparent",
                                    border: activeTab === tab.key ? "1.5px solid rgba(139,92,246,0.4)" : "1.5px solid transparent",
                                    borderRadius: "999px",
                                    padding: "8px 22px",
                                    color: activeTab === tab.key ? "var(--accent-light)" : "var(--text-secondary)",
                                    fontWeight: activeTab === tab.key ? 800 : 600,
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontFamily: "Nunito, sans-serif",
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Paste Text */}
                    {activeTab === "paste" && (
                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>Your Content</label>
                            <textarea
                                className="input-field"
                                placeholder="Paste your text, notes, article... (minimum 100 characters) 📝"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={10}
                                style={{ resize: "vertical", lineHeight: "1.6" }}
                                id="content-text"
                            />
                            <div style={{ marginTop: "6px", fontSize: "12px", fontWeight: 700, color: text.length < 100 ? "#F87171" : "#34D399" }}>
                                {text.length} characters {text.length < 100 ? `(need ${100 - text.length} more)` : "✓ Ready!"}
                            </div>
                        </div>
                    )}

                    {/* Upload File */}
                    {activeTab === "upload" && (
                        <div style={{ marginBottom: "28px" }}>
                            <input
                                type="file"
                                ref={fileRef}
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                accept=".txt,.pdf,.md"
                                style={{ display: "none" }}
                                id="file-input"
                            />
                            <div
                                className="drop-zone"
                                onClick={() => fileRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
                            >
                                {uploadLoading ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                                        <div style={{ fontSize: "40px" }} className="animate-wiggle">📄</div>
                                        <div className="spinner" />
                                        <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Extracting text...</p>
                                    </div>
                                ) : fileName ? (
                                    <div>
                                        <p style={{ fontSize: "40px", marginBottom: "8px" }}>✅</p>
                                        <p style={{ fontWeight: 800, marginBottom: "4px" }}>{fileName}</p>
                                        <p style={{ color: "#34D399", fontSize: "14px", fontWeight: 700 }}>{text.length} characters extracted 🎉</p>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "8px", fontWeight: 600 }}>Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: "48px", marginBottom: "12px" }} className="animate-float">☁️</p>
                                        <p style={{ fontWeight: 800, marginBottom: "6px", fontSize: "16px" }}>Drop your file here</p>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>or click to browse</p>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginTop: "12px", opacity: 0.6 }}>Supports: PDF, TXT, MD</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Topic */}
                    {activeTab === "topic" && (
                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>Topic</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Photosynthesis, World War II, Machine Learning... 💡"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                id="topic-input"
                            />
                            <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                                AI will generate content about this topic and create a quiz from it — no text needed! 🤖
                            </p>
                        </div>
                    )}

                    <div className="divider" />

                    {/* Quiz Mode */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "14px" }}>
                            🎮 Quiz Mode
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {MODES.map((m) => {
                                const isActive = mode === m.value;
                                return (
                                    <button
                                        key={m.value}
                                        onClick={() => setMode(m.value)}
                                        style={{
                                            padding: "16px 12px",
                                            borderRadius: "16px",
                                            border: `1.5px solid ${isActive ? m.border : "rgba(255,255,255,0.08)"}`,
                                            background: isActive ? m.bg : "rgba(255,255,255,0.03)",
                                            cursor: "pointer",
                                            textAlign: "center",
                                            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            transform: isActive ? "scale(1.03)" : "scale(1)",
                                            fontFamily: "Nunito, sans-serif",
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", marginBottom: "6px" }}>{m.icon}</div>
                                        <div style={{ fontWeight: 800, fontSize: "14px", color: isActive ? m.color : "var(--text-primary)", marginBottom: "4px" }}>{m.label}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{m.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "14px" }}>
                            {mode === "adaptive" ? "🎯 Starting Difficulty" : "💪 Difficulty Level"}
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {DIFFICULTIES.map((d) => {
                                const isActive = difficulty === d.value;
                                return (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value)}
                                        style={{
                                            padding: "16px 12px",
                                            borderRadius: "16px",
                                            border: `1.5px solid ${isActive ? d.border : "rgba(255,255,255,0.08)"}`,
                                            background: isActive ? d.bg : "rgba(255,255,255,0.03)",
                                            cursor: "pointer",
                                            textAlign: "center",
                                            transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                                            transform: isActive ? "scale(1.03)" : "scale(1)",
                                            fontFamily: "Nunito, sans-serif",
                                        }}
                                    >
                                        <div style={{ fontSize: "24px", marginBottom: "6px" }}>{d.icon}</div>
                                        <div style={{ fontWeight: 800, fontSize: "14px", color: isActive ? d.color : "var(--text-primary)", marginBottom: "4px" }}>{d.label}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: 600 }}>{d.desc}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Question Count */}
                    <div style={{ marginBottom: "32px" }}>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "12px" }}>
                            <span>🔢 Number of Questions</span>
                            <span style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)", color: "white", borderRadius: "999px", padding: "4px 14px", fontWeight: 900, fontSize: "15px" }}>
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
                            style={{ width: "100%" }}
                            id="num-questions"
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: 700 }}>
                            <span>5 — Quick ⚡</span>
                            <span>20 — Comprehensive 📚</span>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ background: "rgba(248,113,113,0.1)", border: "1.5px solid rgba(248,113,113,0.35)", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#F87171", fontWeight: 700 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "17px", cursor: "pointer" }}
                        id="generate-btn"
                    >
                        🚀 Generate {numQuestions} Questions
                    </button>
                </div>
            </div>
        </div>
    );
}
