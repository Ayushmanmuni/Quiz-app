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
        <div style={{ position: "relative", minHeight: "calc(100vh - 72px)" }}>
            <div className="bg-mesh" />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 72px)", padding: "40px 24px" }}>
                <div className="glass-strong animate-slide-up" style={{ width: "100%", maxWidth: "440px", padding: "48px 40px" }}>
                    <div style={{ textAlign: "center", marginBottom: "36px" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: "linear-gradient(135deg, #4f6ef7, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 20px", boxShadow: "0 0 30px rgba(79, 110, 247, 0.4)" }}>🚀</div>
                        <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>Create your account</h1>
                        <p style={{ color: "rgba(175,175,210,0.7)", fontSize: "14px" }}>Free forever. No credit card required.</p>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(255, 77, 109, 0.1)", border: "1px solid rgba(255, 77, 109, 0.3)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#ff4d6d", display: "flex", alignItems: "center", gap: "8px" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Full Name</label>
                            <input type="text" className="input-field" placeholder="Ayush Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required id="name" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Email Address</label>
                            <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required id="email" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Password</label>
                            <input type="password" className="input-field" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required id="password" />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "rgba(175,175,210,0.9)", marginBottom: "8px" }}>Confirm Password</label>
                            <input type="password" className="input-field" placeholder="Repeat your password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required id="confirm" />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "8px", opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? (<><div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }} />Creating account...</>) : "Create Account →"}
                        </button>
                    </form>

                    <div className="divider" />
                    <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(175,175,210,0.7)" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "#6b8cff", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
