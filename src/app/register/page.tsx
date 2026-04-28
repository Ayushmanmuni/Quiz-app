"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        });
        const data = await res.json();
        setLoading(false);
        if (!res.ok) {
            setError(data.error || "Registration failed. Please try again.");
        } else {
            router.push("/login?registered=true");
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
                            className="animate-bounce"
                        >
                            🚀
                        </div>
                        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px" }}>Create your account 🎉</h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600 }}>Free forever. No credit card required.</p>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(248, 113, 113, 0.1)", border: "1.5px solid rgba(248, 113, 113, 0.35)", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#F87171", display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { id: "name",     label: "Full Name",        type: "text",     placeholder: "Your awesome name 😊",  key: "name" as const },
                            { id: "email",    label: "Email Address",    type: "email",    placeholder: "you@example.com",         key: "email" as const },
                            { id: "password", label: "Password",         type: "password", placeholder: "Min. 6 characters 🔒",   key: "password" as const },
                            { id: "confirm",  label: "Confirm Password", type: "password", placeholder: "Repeat your password",    key: "confirm" as const },
                        ].map((field) => (
                            <div key={field.id}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "var(--text-secondary)", marginBottom: "8px" }}>{field.label}</label>
                                <input
                                    type={field.type}
                                    className="input-field"
                                    placeholder={field.placeholder}
                                    value={form[field.key]}
                                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                    required
                                    id={field.id}
                                />
                            </div>
                        ))}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ width: "100%", justifyContent: "center", marginTop: "8px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer", fontSize: "16px", padding: "15px" }}
                        >
                            {loading
                                ? <><div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />Creating account...</>
                                : "🌟 Create Free Account"
                            }
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "var(--accent-light)", fontWeight: 800, textDecoration: "none" }}>Sign in 👋</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
