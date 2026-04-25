"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

type ThemeMode = "dark" | "light";
type ThemePref = "system" | "dark" | "light";
type Difficulty = "easy" | "medium" | "hard";
type BubblePosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";
type BubbleSize = "small" | "medium" | "large";

function getStored<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const v = window.localStorage.getItem(key);
        if (v === null) return fallback;
        return JSON.parse(v) as T;
    } catch {
        return fallback;
    }
}

function setStored<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function useClickOutside(ref: React.RefObject<HTMLElement>, onOutside: () => void, enabled: boolean) {
    useEffect(() => {
        if (!enabled) return;
        const onDown = (e: MouseEvent) => {
            const el = ref.current;
            if (!el) return;
            if (e.target instanceof Node && !el.contains(e.target)) onOutside();
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [enabled, onOutside, ref]);
}

function SettingsMenu({ variant = "navbar" }: { variant?: "navbar" | "floating" }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const [themePref, setThemePref] = useState<ThemePref>("system");
    const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>("dark");
    const [bubblePosition, setBubblePosition] = useState<BubblePosition>("bottom-left");
    const [bubbleSize, setBubbleSize] = useState<BubbleSize>("medium");
    const [difficulty, setDifficulty] = useState<Difficulty>("medium");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        setThemePref(getStored<ThemePref>("quizai_theme_pref", "system"));
        setBubblePosition(getStored<BubblePosition>("quizai_settings_position", "bottom-left"));
        setBubbleSize(getStored<BubbleSize>("quizai_settings_size", "medium"));
        setDifficulty(getStored<Difficulty>("quizai_difficulty", "medium"));
        setNotes(getStored<string>("quizai_notes", ""));
    }, []);

    useEffect(() => {
        setStored("quizai_theme_pref", themePref);
    }, [themePref]);

    useEffect(() => {
        const mql = window.matchMedia?.("(prefers-color-scheme: light)");
        const compute = () => {
            if (themePref === "dark") return "dark" as const;
            if (themePref === "light") return "light" as const;
            return mql?.matches ? ("light" as const) : ("dark" as const);
        };
        const apply = () => {
            const next = compute();
            setResolvedTheme(next);
            document.documentElement.classList.toggle("theme-light", next === "light");
        };
        apply();
        if (!mql) return;
        const onChange = () => apply();
        // Safari fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyMql = mql as any;
        if (anyMql.addEventListener) anyMql.addEventListener("change", onChange);
        else anyMql.addListener?.(onChange);
        return () => {
            if (anyMql.removeEventListener) anyMql.removeEventListener("change", onChange);
            else anyMql.removeListener?.(onChange);
        };
    }, [themePref]);

    useEffect(() => {
        setStored("quizai_difficulty", difficulty);
    }, [difficulty]);

    useEffect(() => {
        setStored("quizai_settings_position", bubblePosition);
    }, [bubblePosition]);

    useEffect(() => {
        setStored("quizai_settings_size", bubbleSize);
    }, [bubbleSize]);

    useEffect(() => {
        const t = window.setTimeout(() => setStored("quizai_notes", notes), 250);
        return () => window.clearTimeout(t);
    }, [notes]);

    useClickOutside(containerRef, () => setOpen(false), open);

    const accountLabel = useMemo(() => {
        if (!session?.user) return "Guest";
        return session.user.name || session.user.email || "Account";
    }, [session]);

    const go = (href: string) => {
        setOpen(false);
        if (pathname === href) return;
        router.push(href);
    };

    const bubbleMetrics = useMemo(() => {
        const px = bubbleSize === "small" ? 34 : bubbleSize === "large" ? 46 : 40;
        const font = bubbleSize === "small" ? 14 : bubbleSize === "large" ? 18 : 16;
        const pad = bubbleSize === "small" ? 12 : bubbleSize === "large" ? 18 : 16;
        return { px, font, pad };
    }, [bubbleSize]);

    const floatingPositionStyle = useMemo(() => {
        const inset = 16;
        switch (bubblePosition) {
            case "bottom-left":
                return { left: inset, bottom: inset };
            case "bottom-right":
                return { right: inset, bottom: inset };
            case "top-left":
                return { left: inset, top: inset };
            case "top-right":
                return { right: inset, top: inset };
        }
    }, [bubblePosition]);

    const panelPlacementStyle = useMemo(() => {
        if (variant !== "floating") return { right: 0, top: "calc(100% + 10px)" } as const;
        // open inward from the corner
        const gap = 12;
        if (bubblePosition.startsWith("bottom")) {
            return {
                ...(bubblePosition.endsWith("left") ? { left: 0 } : { right: 0 }),
                bottom: `calc(100% + ${gap}px)`,
            } as const;
        }
        return {
            ...(bubblePosition.endsWith("left") ? { left: 0 } : { right: 0 }),
            top: `calc(100% + ${gap}px)`,
        } as const;
    }, [bubblePosition, variant]);

    return (
        <div
            ref={containerRef}
            style={
                variant === "floating"
                    ? { position: "fixed", zIndex: 500, ...floatingPositionStyle }
                    : { position: "relative" }
            }
        >
            {variant === "floating" ? (
                <button
                    onClick={() => setOpen((v) => !v)}
                    style={{
                        width: bubbleMetrics.px,
                        height: bubbleMetrics.px,
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.35)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: bubbleMetrics.font,
                    }}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    title="Settings"
                >
                    ⚙️
                </button>
            ) : (
                <button
                    onClick={() => setOpen((v) => !v)}
                    className="btn-secondary"
                    style={{
                        padding: "9px 14px",
                        borderRadius: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                    }}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    title="Settings"
                >
                    <span style={{ fontSize: "16px" }}>⚙️</span>
                    <span style={{ opacity: 0.9 }}>Settings</span>
                </button>
            )}

            {open && (
                <div
                    role="menu"
                    aria-label="Settings menu"
                    className="glass-strong"
                    style={{
                        position: "absolute",
                        ...panelPlacementStyle,
                        width: "360px",
                        padding: bubbleMetrics.pad,
                        boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
                        zIndex: 200,
                        color: "var(--text-primary)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>Account</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                                {accountLabel}
                            </div>
                        </div>
                        {session ? (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    signOut({ callbackUrl: "/" });
                                }}
                                style={{
                                    background: "rgba(255, 77, 109, 0.12)",
                                    border: "1px solid rgba(255, 77, 109, 0.25)",
                                    color: "rgba(255, 77, 109, 0.95)",
                                    padding: "8px 12px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                }}
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    signIn(undefined, { callbackUrl: "/dashboard" });
                                }}
                                style={{
                                    background: "rgba(16, 217, 138, 0.12)",
                                    border: "1px solid rgba(16, 217, 138, 0.25)",
                                    color: "rgba(16, 217, 138, 0.95)",
                                    padding: "8px 12px",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "12px",
                                }}
                            >
                                Login
                            </button>
                        )}
                    </div>

                    <div className="divider" style={{ margin: "12px 0" }} />

                    {/* Preferences (like Next DevTools UI) */}
                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontWeight: 900, fontSize: "15px", marginBottom: "10px" }}>Preferences</div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0" }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>Theme</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Select your theme preference.</div>
                            </div>
                            <select
                                value={themePref}
                                onChange={(e) => setThemePref(e.target.value as ThemePref)}
                                className="input-field"
                                style={{
                                    width: 140,
                                    padding: "10px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    borderColor: "var(--border-color)",
                                    colorScheme: resolvedTheme,
                                }}
                                aria-label="Theme preference"
                            >
                                <option value="system">System</option>
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0" }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>Position</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Adjust the placement of your tools.</div>
                            </div>
                            <select
                                value={bubblePosition}
                                onChange={(e) => setBubblePosition(e.target.value as BubblePosition)}
                                className="input-field"
                                style={{
                                    width: 140,
                                    padding: "10px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    borderColor: "var(--border-color)",
                                    colorScheme: resolvedTheme,
                                }}
                                aria-label="Bubble position"
                            >
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-right">Bottom Right</option>
                                <option value="top-left">Top Left</option>
                                <option value="top-right">Top Right</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0" }}>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>Size</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Adjust the size of the tools.</div>
                            </div>
                            <select
                                value={bubbleSize}
                                onChange={(e) => setBubbleSize(e.target.value as BubbleSize)}
                                className="input-field"
                                style={{
                                    width: 140,
                                    padding: "10px 12px",
                                    fontSize: "13px",
                                    background: "var(--bg-secondary)",
                                    color: "var(--text-primary)",
                                    borderColor: "var(--border-color)",
                                    colorScheme: resolvedTheme,
                                }}
                                aria-label="Bubble size"
                            >
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>

                    <div className="divider" style={{ margin: "12px 0" }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        <button onClick={() => go("/dashboard")} className="btn-secondary" style={{ padding: "10px 12px", fontSize: "13px", justifyContent: "center" }}>
                            📈 Progress
                        </button>
                        <button onClick={() => go("/upload")} className="btn-primary" style={{ padding: "10px 12px", fontSize: "13px", justifyContent: "center" }}>
                            + New Quiz
                        </button>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px" }}>Default difficulty</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {(
                                [
                                    { value: "easy", label: "Easy", icon: "🟢" },
                                    { value: "medium", label: "Medium", icon: "🟡" },
                                    { value: "hard", label: "Hard", icon: "🔴" },
                                ] as const
                            ).map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDifficulty(d.value)}
                                    style={{
                                        padding: "10px 10px",
                                        borderRadius: "12px",
                                        cursor: "pointer",
                                        border: `1px solid ${difficulty === d.value ? "rgba(79,110,247,0.55)" : "rgba(255,255,255,0.10)"}`,
                                        background: difficulty === d.value ? "rgba(79,110,247,0.14)" : "rgba(255,255,255,0.03)",
                                        color: difficulty === d.value ? "var(--accent-light)" : "var(--text-primary)",
                                        fontWeight: 800,
                                        fontSize: "12px",
                                    }}
                                >
                                    <span style={{ marginRight: "6px" }}>{d.icon}</span>
                                    {d.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
                            Current theme: <span style={{ fontWeight: 800 }}>{resolvedTheme}</span>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                            <div style={{ fontWeight: 800, fontSize: "14px" }}>Quick notes</div>
                            <button
                                onClick={() => setNotes("")}
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    color: "rgba(175,175,210,0.8)",
                                    borderRadius: "10px",
                                    padding: "6px 10px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                }}
                            >
                                Clear
                            </button>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="input-field"
                            rows={4}
                            placeholder="Save study reminders, weak topics, formulas…"
                            style={{ resize: "vertical", fontSize: "13px", lineHeight: 1.5 }}
                        />
                        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>Saved locally in this browser.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Navbar() {
    const { data: session } = useSession();

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

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <Navbar />
            <main>{children}</main>
            <SettingsMenu variant="floating" />
        </SessionProvider>
    );
}
