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

        const result = await signIn("credentials", {
            email: form.email,
            password: form.password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError("Invalid email or password. Please try again.");
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "calc(100vh - 72px)",
                    padding: "40px 24px",
                }}
            >
                <div
                    className="glass-strong animate-slide-up"
                    style={{ width: "100%", maxWidth: "440px", padding: "48px 40px" }}
                >
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <div
                            style={{
                                width: "56px",
                                height: "56px",
                                borderRadius: "16px",
                                background: "linear-gradient(135deg, #4f6ef7, #a78bfa)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "26px",
                                margin: "0 auto 20px",
                                boxShadow: "0 0 30px rgba(79, 110, 247, 0.4)",
                            }}
                        >
                            ⚡
                        </div>
                        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>
                            Welcome back
                        </h1>
                        <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "14px" }}>
                            Sign in to continue to QuizAI
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            style={{
                                background: "rgba(255, 77, 109, 0.1)",
                                border: "1px solid rgba(255, 77, 109, 0.3)",
                                borderRadius: "10px",
                                padding: "12px 16px",
                                marginBottom: "20px",
                                fontSize: "14px",
                                color: "#ff4d6d",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "rgba(175,175,210,0.9)",
                                    marginBottom: "8px",
                                    letterSpacing: "0.3px",
                                }}
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                                id="email"
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    color: "rgba(175,175,210,0.9)",
                                    marginBottom: "8px",
                                }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                                id="password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                width: "100%",
                                justifyContent: "center",
                                marginTop: "8px",
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In →"
                            )}
                        </button>
                    </form>

                    <div className="divider" />

                    <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(175,175,210,0.7)" }}>
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            style={{ color: "#6b8cff", fontWeight: 600, textDecoration: "none" }}
                        >
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
