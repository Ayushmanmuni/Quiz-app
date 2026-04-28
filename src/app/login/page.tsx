"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
        setLoading(false);
        if (result?.error) {
            setError(
                result.error === "CredentialsSignin"
                    ? "Invalid email or password. Please try again."
                    : "Sign-in failed due to a server error. Check your connection and try again."
            );
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 70px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 70px)", padding: "40px 24px" }}>
                <div className="glass-strong animate-slide-up" style={{ width: "100%", maxWidth: "440px", padding: "48px 40px" }}>
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "20px",
                                background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "32px",
                                margin: "0 auto 20px",
                                boxShadow: "0 0 35px rgba(139, 92, 246, 0.5)",
                            }}
                            className="animate-wiggle"
                        >
                            🧠
                        </div>
                        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px" }}>Welcome back! 👋</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>Sign in to continue to QuizAI</p>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(248, 113, 113, 0.1)", border: "1.5px solid rgba(248, 113, 113, 0.35)", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#F87171", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>Email Address</label>
                            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="email" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>Password</label>
                            <input type="password" className="input-field" placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required id="password" />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: "100%", justifyContent: "center", marginTop: "8px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", fontSize: "16px", padding: "15px" }}
                        >
                            {loading
                                ? <><div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />Signing in...</>
                                : "🚀 Sign In"
                            }
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/register" style={{ color: "var(--accent-light)", fontWeight: 800, textDecoration: "none" }}>Create one free 🎉</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
