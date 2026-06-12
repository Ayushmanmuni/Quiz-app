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

    const [themePref, setThemePref] = useState<ThemePref>(() => getStored<ThemePref>("quizai_theme_pref", "system"));
    const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>("dark");
    const [bubblePosition, setBubblePosition] = useState<BubblePosition>(() => getStored<BubblePosition>("quizai_settings_position", "bottom-left"));
    const [bubbleSize, setBubbleSize] = useState<BubbleSize>(() => getStored<BubbleSize>("quizai_settings_size", "medium"));
    const [difficulty, setDifficulty] = useState<Difficulty>(() => getStored<Difficulty>("quizai_difficulty", "medium"));
    const [notes, setNotes] = useState(() => getStored<string>("quizai_notes", ""));

    useEffect(() => { setStored("quizai_theme_pref", themePref); }, [themePref]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyMql = mql as any;
        if (anyMql.addEventListener) anyMql.addEventListener("change", onChange);
        else anyMql.addListener?.(onChange);
        return () => {
            if (anyMql.removeEventListener) anyMql.removeEventListener("change", onChange);
            else anyMql.removeListener?.(onChange);
        };
    }, [themePref]);

    useEffect(() => { setStored("quizai_difficulty", difficulty); }, [difficulty]);
    useEffect(() => { setStored("quizai_settings_position", bubblePosition); }, [bubblePosition]);
    useEffect(() => { setStored("quizai_settings_size", bubbleSize); }, [bubbleSize]);
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
            case "bottom-left":  return { left: inset, bottom: inset };
            case "bottom-right": return { right: inset, bottom: inset };
            case "top-left":     return { left: inset, top: inset };
            case "top-right":    return { right: inset, top: inset };
        }
    }, [bubblePosition]);

    const panelPlacementStyle = useMemo(() => {
        if (variant !== "floating") return { right: 0, top: "calc(100% + 10px)" } as const;
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
                        background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))",
                        border: "1.5px solid rgba(139,92,246,0.4)",
                        boxShadow: "0 8px 30px rgba(139,92,246,0.35)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: bubbleMetrics.font,
                        transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
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
                    style={{ padding: "9px 14px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
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
                    className="glass-strong settings-panel"
                    style={{
                        ...panelPlacementStyle,
                        padding: bubbleMetrics.pad,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>Account</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {accountLabel}
                            </div>
                        </div>
                        {session ? (
                            <button
                                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                                style={{ background: "rgba(248,113,113,0.12)", border: "1.5px solid rgba(248,113,113,0.3)", color: "#F87171", padding: "8px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: 800, fontSize: "12px", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}
                            >
                                Logout
                            </button>
                        ) : (
                            <button
                                onClick={() => { setOpen(false); signIn(undefined, { callbackUrl: "/dashboard" }); }}
                                style={{ background: "rgba(52,211,153,0.12)", border: "1.5px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "8px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: 800, fontSize: "12px", fontFamily: "Nunito, sans-serif", flexShrink: 0 }}
                            >
                                Login
                            </button>
                        )}
                    </div>

                    <div className="divider" style={{ margin: "12px 0" }} />

                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontWeight: 900, fontSize: "15px", marginBottom: "10px" }}>Preferences</div>

                        {[
                            { label: "Theme", desc: "Select your theme preference.", value: themePref, onChange: (v: string) => setThemePref(v as ThemePref), options: [{ value: "system", label: "System" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }] },
                            { label: "Position", desc: "Adjust the placement of your tools.", value: bubblePosition, onChange: (v: string) => setBubblePosition(v as BubblePosition), options: [{ value: "bottom-left", label: "Bottom Left" }, { value: "bottom-right", label: "Bottom Right" }, { value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }] },
                            { label: "Size", desc: "Adjust the size of the tools.", value: bubbleSize, onChange: (v: string) => setBubbleSize(v as BubbleSize), options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] },
                        ].map((pref) => (
                            <div key={pref.label} className="settings-pref-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 0" }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px" }}>{pref.label}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pref.desc}</div>
                                </div>
                                <select
                                    value={pref.value}
                                    onChange={(e) => pref.onChange(e.target.value)}
                                    className="input-field settings-pref-select"
                                    style={{ width: 140, padding: "10px 12px", fontSize: "13px", background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-color)", colorScheme: resolvedTheme, flexShrink: 0 }}
                                >
                                    {pref.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="divider" style={{ margin: "12px 0" }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                        <button onClick={() => go("/dashboard")} className="btn-secondary" style={{ padding: "10px 12px", fontSize: "13px", justifyContent: "center" }}>📈 Progress</button>
                        <button onClick={() => go("/upload")} className="btn-primary" style={{ padding: "10px 12px", fontSize: "13px", justifyContent: "center" }}>+ New Quiz</button>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "6px" }}>Default difficulty</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                            {([{ value: "easy", label: "Easy", icon: "🟢", color: "rgba(52,211,153," }, { value: "medium", label: "Medium", icon: "🟡", color: "rgba(251,191,36," }, { value: "hard", label: "Hard", icon: "🔴", color: "rgba(248,113,113," }] as const).map((d) => (
                                <button
                                    key={d.value}
                                    onClick={() => setDifficulty(d.value)}
                                    style={{ padding: "8px 4px", borderRadius: "12px", cursor: "pointer", border: `1.5px solid ${difficulty === d.value ? d.color + "0.55)" : "rgba(255,255,255,0.08)"}`, background: difficulty === d.value ? d.color + "0.12)" : "rgba(255,255,255,0.03)", color: difficulty === d.value ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: 800, fontSize: "12px", fontFamily: "Nunito, sans-serif" }}
                                >
                                    <span style={{ marginRight: "5px" }}>{d.icon}</span>{d.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
                            Current theme: <span style={{ fontWeight: 800, color: "var(--accent-light)" }}>{resolvedTheme}</span>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                            <div style={{ fontWeight: 800, fontSize: "14px" }}>Quick notes</div>
                            <button onClick={() => setNotes("")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", borderRadius: "999px", padding: "5px 10px", cursor: "pointer", fontSize: "12px", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>Clear</button>
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
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-logo-link">
                    <div className="navbar-logo-wrapper">
                        <div className="navbar-logo-icon">🧠</div>
                        <span className="navbar-logo-text">QuizAI</span>
                    </div>
                </Link>

                <div className="navbar-actions">
                    {session ? (
                        <>
                            <Link href="/upload" className="navbar-link">
                                <button className="navbar-btn-action">
                                    <span className="navbar-btn-emoji">✨</span>
                                    <span className="navbar-btn-text">New Quiz</span>
                                </button>
                            </Link>
                            <Link href="/dashboard" className="navbar-link">
                                <button className="navbar-btn-action">
                                    <span className="navbar-btn-emoji">📊</span>
                                    <span className="navbar-btn-text">Dashboard</span>
                                </button>
                            </Link>
                            <div className="navbar-user-badge">
                                <div className="navbar-user-avatar">
                                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                                </div>
                                <span className="navbar-user-name">
                                    {session.user?.name || session.user?.email}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="navbar-link">
                                <button className="btn-secondary navbar-auth-btn">
                                    Sign In
                                </button>
                            </Link>
                            <Link href="/register" className="navbar-link">
                                <button className="btn-primary navbar-auth-btn">
                                    🚀 <span className="navbar-btn-text">Get Started</span>
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
