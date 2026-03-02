"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav
            style={{
                background: "rgba(5, 5, 15, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                height: "72px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 24px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #4f6ef7, #a78bfa)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                boxShadow: "0 0 20px rgba(79, 110, 247, 0.4)",
                            }}
                        >
                            ⚡
                        </div>
                        <span
                            style={{
                                fontSize: "20px",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #6b8cff, #a78bfa)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            QuizAI
                        </span>
                    </div>
                </Link>

                {/* Nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {session ? (
                        <>
                            <Link href="/upload" style={{ textDecoration: "none" }}>
                                <button
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "rgba(240, 240, 255, 0.7)",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLButtonElement).style.color = "#f0f0ff";
                                        (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLButtonElement).style.color = "rgba(240, 240, 255, 0.7)";
                                        (e.target as HTMLButtonElement).style.background = "transparent";
                                    }}
                                >
                                    + New Quiz
                                </button>
                            </Link>
                            <Link href="/dashboard" style={{ textDecoration: "none" }}>
                                <button
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "rgba(240, 240, 255, 0.7)",
                                        padding: "8px 16px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                        transition: "all 0.2s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.target as HTMLButtonElement).style.color = "#f0f0ff";
                                        (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.target as HTMLButtonElement).style.color = "rgba(240, 240, 255, 0.7)";
                                        (e.target as HTMLButtonElement).style.background = "transparent";
                                    }}
                                >
                                    Dashboard
                                </button>
                            </Link>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginLeft: "8px",
                                    padding: "6px 14px",
                                    background: "rgba(255, 255, 255, 0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    borderRadius: "10px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        background: "linear-gradient(135deg, #4f6ef7, #a78bfa)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "white",
                                    }}
                                >
                                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontSize: "13px", color: "rgba(240,240,255,0.8)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {session.user?.name || session.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "rgba(255, 77, 109, 0.8)",
                                        cursor: "pointer",
                                        fontSize: "18px",
                                        padding: "2px",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                    title="Sign out"
                                >
                                    ⏻
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" style={{ textDecoration: "none" }}>
                                <button className="btn-secondary" style={{ padding: "9px 20px", fontSize: "14px" }}>
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/register" style={{ textDecoration: "none" }}>
                                <button className="btn-primary" style={{ padding: "9px 20px", fontSize: "14px" }}>
                                    Get Started
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
