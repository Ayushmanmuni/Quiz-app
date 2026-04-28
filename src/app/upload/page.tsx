"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const DIFFICULTIES = [
    { value: "easy", label: "Easy", icon: "🟢", desc: "Factual recall" },
    { value: "medium", label: "Medium", icon: "🟡", desc: "Comprehension" },
    { value: "hard", label: "Hard", icon: "🔴", desc: "Analysis" },
];

const MODES = [
    { value: "standard", label: "Standard", icon: "📝", desc: "Classic quiz format" },
    { value: "study", label: "Study", icon: "📖", desc: "Learn first, quiz after" },
    { value: "adaptive", label: "Adaptive", icon: "🎯", desc: "Difficulty adjusts to you" },
];

export default function UploadPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [mode, setMode] = useState("standard");
    const [numQuestions, setNumQuestions] = useState(10);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"paste" | "upload" | "topic">("paste");
    const [fileName, setFileName] = useState("");
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

        const res = await fetch("/api/quiz", { method: "POST", body: formData });
        const data = await res.json();
        setUploadLoading(false);

        if (!res.ok) {
            setError(data.error || "Failed to process file");
        } else {
            setText(data.text);
            setFileName(file.name);
        }
    };

    const handleGenerate = async () => {
        if (activeTab === "topic") {
            if (!topic.trim() || topic.trim().length < 3) {
                setError("Please enter a topic (at least 3 characters).");
                return;
            }
        } else {
            if (!text.trim() || text.trim().length < 100) {
                setError("Please provide at least 100 characters of text.");
                return;
            }
        }

        setError("");
        setLoading(true);

        const body: Record<string, unknown> = {
            difficulty,
            numQuestions,
            mode,
            title: title || (activeTab === "topic" ? `${topic} Quiz` : `Quiz – ${new Date().toLocaleDateString("en-IN")}`),
        };

        if (activeTab === "topic") {
            body.topic = topic;
            body.source = "topic";
        } else {
            body.text = text;
            body.source = activeTab === "upload" ? "file" : "text";
        }

        const res = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
            setLoading(false);
            setError(data.error || "Failed to generate quiz");
        } else {
            router.push(`/quiz/${data.quizId}`);
        }
    };

    if (!session) {
        return (
            <div style={{ textAlign: "center", padding: "120px 24px" }}>
                <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "16px" }}>
                    Please <a href="/login" style={{ color: "#6b8cff" }}>sign in</a> to generate a quiz.
                </p>
            </div>
        );
    }

    const tabs = [
        { key: "paste" as const, label: "✏️ Paste Text" },
        { key: "upload" as const, label: "📁 Upload File" },
        { key: "topic" as const, label: "💡 Enter Topic" },
    ];

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "50px 24px" }}>
                <div className="animate-slide-up">
                    <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>✨ Generate New Quiz</h1>
                    <p style={{ color: "rgba(175,175,210,0.7)", marginBottom: "40px", fontSize: "15px" }}>Paste text, upload a file, or just enter a topic — AI does the rest</p>
                </div>

                <div className="glass-strong animate-slide-up" style={{ padding: "36px" }}>
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Quiz Title (optional)</label>
                        <input type="text" className="input-field" placeholder="e.g. CBSE Physics Chapter 5" value={title} onChange={(e) => setTitle(e.target.value)} id="quiz-title" />
                    </div>

                    {/* Source Tabs */}
                    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "4px", marginBottom: "20px", width: "fit-content" }}>
                        {tabs.map((tab) => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ background: activeTab === tab.key ? "rgba(79,110,247,0.2)" : "transparent", border: activeTab === tab.key ? "1px solid rgba(79,110,247,0.4)" : "1px solid transparent", borderRadius: "8px", padding: "8px 20px", color: activeTab === tab.key ? "#6b8cff" : "rgba(175,175,210,0.6)", fontWeight: activeTab === tab.key ? 600 : 400, fontSize: "14px", cursor: "pointer", transition: "all 0.2s ease" }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    {activeTab === "paste" && (
                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Your Content</label>
                            <textarea className="input-field" placeholder="Paste your text, notes, article... (minimum 100 characters)" value={text} onChange={(e) => setText(e.target.value)} rows={10} style={{ resize: "vertical", lineHeight: "1.6" }} id="content-text" />
                            <div style={{ marginTop: "6px", fontSize: "12px", color: text.length < 100 ? "#ff4d6d" : "#10d98a" }}>
                                {text.length} characters {text.length < 100 ? `(need ${100 - text.length} more)` : "✓"}
                            </div>
                        </div>
                    )}

                    {activeTab === "upload" && (
                        <div style={{ marginBottom: "28px" }}>
                            <input type="file" ref={fileRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".txt,.pdf,.md" style={{ display: "none" }} id="file-input" />
                            <div className="drop-zone" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}>
                                {uploadLoading ? (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                                        <div className="spinner" />
                                        <p style={{ color: "rgba(175,175,210,0.7)" }}>Extracting text...</p>
                                    </div>
                                ) : fileName ? (
                                    <div>
                                        <p style={{ fontSize: "32px", marginBottom: "8px" }}>✅</p>
                                        <p style={{ fontWeight: 600, marginBottom: "4px" }}>{fileName}</p>
                                        <p style={{ color: "#10d98a", fontSize: "14px" }}>{text.length} characters extracted</p>
                                        <p style={{ color: "rgba(175,175,210,0.5)", fontSize: "13px", marginTop: "8px" }}>Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: "40px", marginBottom: "12px" }}>☁️</p>
                                        <p style={{ fontWeight: 600, marginBottom: "6px", fontSize: "16px" }}>Drop your file here</p>
                                        <p style={{ color: "rgba(175,175,210,0.6)", fontSize: "14px" }}>or click to browse</p>
                                        <p style={{ color: "rgba(175,175,210,0.4)", fontSize: "12px", marginTop: "12px" }}>Supports: PDF, TXT, MD</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "topic" && (
                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Topic</label>
                            <input type="text" className="input-field" placeholder="e.g. Photosynthesis, World War II, Machine Learning..." value={topic} onChange={(e) => setTopic(e.target.value)} id="topic-input" />
                            <p style={{ marginTop: "8px", fontSize: "12px", color: "rgba(175,175,210,0.5)" }}>AI will generate content about this topic and create a quiz from it — no text needed!</p>
                        </div>
                    )}

                    <div className="divider" />

                    {/* Quiz Mode */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "14px" }}>Quiz Mode</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {MODES.map((m) => (
                                <button key={m.value} onClick={() => setMode(m.value)} style={{ padding: "14px 12px", borderRadius: "12px", border: `1px solid ${mode === m.value ? "rgba(79,110,247,0.5)" : "rgba(255,255,255,0.07)"}`, background: mode === m.value ? "rgba(79,110,247,0.12)" : "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease" }}>
                                    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{m.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: "14px", color: mode === m.value ? "#6b8cff" : "#f0f0ff", marginBottom: "4px" }}>{m.label}</div>
                                    <div style={{ fontSize: "11px", color: "rgba(175,175,210,0.5)" }}>{m.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "14px" }}>
                            {mode === "adaptive" ? "Starting Difficulty" : "Difficulty Level"}
                        </label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                            {DIFFICULTIES.map((d) => (
                                <button key={d.value} onClick={() => setDifficulty(d.value)} style={{ padding: "14px 12px", borderRadius: "12px", border: `1px solid ${difficulty === d.value ? "rgba(79,110,247,0.5)" : "rgba(255,255,255,0.07)"}`, background: difficulty === d.value ? "rgba(79,110,247,0.12)" : "rgba(255,255,255,0.03)", cursor: "pointer", textAlign: "center", transition: "all 0.2s ease" }}>
                                    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{d.icon}</div>
                                    <div style={{ fontWeight: 700, fontSize: "14px", color: difficulty === d.value ? "#6b8cff" : "#f0f0ff", marginBottom: "4px" }}>{d.label}</div>
                                    <div style={{ fontSize: "11px", color: "rgba(175,175,210,0.5)" }}>{d.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question Count */}
                    <div style={{ marginBottom: "32px" }}>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "12px" }}>
                            <span>Number of Questions</span>
                            <span style={{ background: "linear-gradient(135deg, #4f6ef7, #6b8cff)", color: "white", borderRadius: "8px", padding: "3px 12px", fontWeight: 700, fontSize: "15px" }}>{numQuestions}</span>
                        </label>
                        <input type="range" min={5} max={20} step={1} value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} style={{ width: "100%" }} id="num-questions" />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "rgba(175,175,210,0.4)", marginTop: "6px" }}>
                            <span>5 (Quick)</span><span>20 (Comprehensive)</span>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(255, 77, 109, 0.1)", border: "1px solid rgba(255, 77, 109, 0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#ff4d6d" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: "100%", justifyContent: "center", fontSize: "16px", padding: "16px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }} id="generate-btn">
                        {loading ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }} />
                                <span>Generating {numQuestions} Questions with AI...</span>
                            </div>
                        ) : `🚀 Generate ${numQuestions} Questions`}
                    </button>

                    {loading && (
                        <p style={{ textAlign: "center", fontSize: "13px", color: "rgba(175,175,210,0.5)", marginTop: "12px" }}>
                            {activeTab === "topic" ? "AI is creating content and generating questions..." : "Hugging Face AI is analyzing your content. This takes 10–30 seconds..."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
