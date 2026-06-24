"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, 
    LayoutDashboard, 
    LogIn, 
    LogOut, 
    Settings, 
    Plus, 
    Moon, 
    Sun, 
    Check,
    FolderPlus,
    User,
    UserCheck,
    LineChart,
    ChevronRight,
    RotateCcw,
    Rocket
} from "lucide-react";

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

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [breakpoint]);
    return isMobile;
}

function SettingsMenu({ variant = "navbar" }: { variant?: "navbar" | "floating" }) {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();

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

    const closePanel = useCallback(() => setOpen(false), []);
    useClickOutside(containerRef, closePanel, open && !isMobile);

    // Lock body scroll when mobile panel is open
    useEffect(() => {
        if (isMobile && open) {
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = ""; };
        }
    }, [isMobile, open]);

    const accountLabel = useMemo(() => {
        if (!session?.user) return "Guest Account";
        return session.user.name || session.user.email || "Account";
    }, [session]);

    const go = (href: string) => {
        setOpen(false);
        if (pathname === href) return;
        router.push(href);
    };

    const bubbleMetrics = useMemo(() => {
        const px = bubbleSize === "small" ? 36 : bubbleSize === "large" ? 48 : 42;
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
                <motion.button
                    onClick={() => setOpen((v) => !v)}
                    whileHover={{ scale: 1.05, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: bubbleMetrics.px,
                        height: bubbleMetrics.px,
                        borderRadius: 999,
                        background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.15))",
                        border: "1px solid rgba(255,255,255,0.15)",
                        boxShadow: "0 8px 32px rgba(139,92,246,0.25)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: bubbleMetrics.font,
                        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 text-indigo-300" />
                </motion.button>
            ) : (
                <motion.button
                    onClick={() => setOpen((v) => !v)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary"
                    style={{ padding: "9px 14px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px" }}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    title="Settings"
                >
                    <Settings className="w-4 h-4 text-indigo-300" />
                    <span style={{ opacity: 0.9 }}>Settings</span>
                </motion.button>
            )}

            <AnimatePresence>
                {/* Mobile backdrop overlay */}
                {open && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closePanel}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                            WebkitBackdropFilter: "blur(4px)",
                            zIndex: 998,
                        }}
                    />
                )}
                {open && (
                    <motion.div
                        initial={isMobile
                            ? { opacity: 0, y: 60 }
                            : { opacity: 0, scale: 0.93, y: variant === "floating" && bubblePosition.startsWith("bottom") ? 10 : -10 }
                        }
                        animate={isMobile
                            ? { opacity: 1, y: 0 }
                            : { opacity: 1, scale: 1, y: 0 }
                        }
                        exit={isMobile
                            ? { opacity: 0, y: 60 }
                            : { opacity: 0, scale: 0.93, y: variant === "floating" && bubblePosition.startsWith("bottom") ? 10 : -10 }
                        }
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        role="menu"
                        aria-label="Settings menu"
                        className="glass-strong settings-panel"
                        style={isMobile ? {
                            position: "fixed",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            width: "100%",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            borderRadius: "24px 24px 0 0",
                            padding: "20px 16px env(safe-area-inset-bottom, 16px)",
                            zIndex: 999,
                        } : {
                            position: "absolute" as const,
                            ...panelPlacementStyle,
                            padding: bubbleMetrics.pad,
                            width: "300px",
                            maxHeight: "calc(100vh - 100px)",
                            overflowY: "auto" as const,
                            zIndex: 1000,
                        }}
                    >
                        {/* Mobile drag handle */}
                        {isMobile && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "12px" }}>
                                <div style={{ width: "40px", height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.2)", marginBottom: "12px" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                    <span style={{ fontWeight: 900, fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Settings className="w-4 h-4 text-indigo-400" />
                                        Settings
                                    </span>
                                    <button
                                        onClick={closePanel}
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "999px",
                                            width: "32px",
                                            height: "32px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            color: "var(--text-secondary)",
                                            fontSize: "18px",
                                            fontFamily: "Nunito, sans-serif",
                                        }}
                                        aria-label="Close settings"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 800, fontSize: "14px", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <User className="w-4 h-4 text-indigo-400" />
                                    <span>Account</span>
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {accountLabel}
                                </div>
                            </div>
                            {session ? (
                                <button
                                    onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                                    style={{ background: "rgba(248,113,113,0.12)", border: "1.5px solid rgba(248,113,113,0.3)", color: "#F87171", padding: "8px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: 800, fontSize: "12px", fontFamily: "Nunito, sans-serif", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    <LogOut className="w-3 h-3" />
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setOpen(false); signIn(undefined, { callbackUrl: "/dashboard" }); }}
                                    style={{ background: "rgba(52,211,153,0.12)", border: "1.5px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "8px 14px", borderRadius: "999px", cursor: "pointer", fontWeight: 800, fontSize: "12px", fontFamily: "Nunito, sans-serif", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}
                                >
                                    <LogIn className="w-3 h-3" />
                                    Login
                                </button>
                            )}
                        </div>

                        <div className="divider" style={{ margin: "12px 0", height: "1px", background: "var(--border-color)" }} />

                        <div style={{ marginBottom: "14px" }}>
                            <div style={{ fontWeight: 900, fontSize: "15px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                <span>Preferences</span>
                            </div>

                            {[
                                { 
                                    label: "Theme", 
                                    desc: "Select visual appearance", 
                                    value: themePref, 
                                    onChange: (v: string) => setThemePref(v as ThemePref), 
                                    options: [{ value: "system", label: "System" }, { value: "dark", label: "Dark" }, { value: "light", label: "Light" }] 
                                },
                                { 
                                    label: "Position", 
                                    desc: "Position of floating tools", 
                                    value: bubblePosition, 
                                    onChange: (v: string) => setBubblePosition(v as BubblePosition), 
                                    options: [{ value: "bottom-left", label: "Bottom Left" }, { value: "bottom-right", label: "Bottom Right" }, { value: "top-left", label: "Top Left" }, { value: "top-right", label: "Top Right" }] 
                                },
                                { 
                                    label: "Size", 
                                    desc: "Floating bubble size", 
                                    value: bubbleSize, 
                                    onChange: (v: string) => setBubbleSize(v as BubbleSize), 
                                    options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }] 
                                },
                            ].map((pref) => (
                                <div key={pref.label} className="settings-pref-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "8px 0" }}>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: "13px", marginBottom: "1px" }}>{pref.label}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pref.desc}</div>
                                    </div>
                                    <select
                                        value={pref.value}
                                        onChange={(e) => pref.onChange(e.target.value)}
                                        className="input-field settings-pref-select"
                                        style={{ width: 130, padding: "8px 10px", borderRadius: "10px", fontSize: "12px", background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border-color)", colorScheme: resolvedTheme, flexShrink: 0 }}
                                    >
                                        {pref.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="divider" style={{ margin: "12px 0", height: "1px", background: "var(--border-color)" }} />

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                            <button 
                                onClick={() => go("/dashboard")} 
                                className="btn-secondary" 
                                style={{ padding: "8px 10px", borderRadius: "999px", fontSize: "12px", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                <LineChart className="w-3.5 h-3.5" />
                                Progress
                            </button>
                            <button 
                                onClick={() => go("/upload")} 
                                className="btn-primary" 
                                style={{ padding: "8px 10px", borderRadius: "999px", fontSize: "12px", justifyContent: "center", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New Quiz
                            </button>
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <div style={{ fontWeight: 800, fontSize: "13px", marginBottom: "8px" }}>Default difficulty</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                                {([
                                    { value: "easy", label: "Easy", color: "rgba(52,211,153," }, 
                                    { value: "medium", label: "Medium", color: "rgba(251,191,36," }, 
                                    { value: "hard", label: "Hard", color: "rgba(248,113,113," }
                                ] as const).map((d) => (
                                    <button
                                        key={d.value}
                                        onClick={() => setDifficulty(d.value)}
                                        style={{ padding: "6px 2px", borderRadius: "10px", cursor: "pointer", border: `1.5px solid ${difficulty === d.value ? d.color + "0.55)" : "rgba(255,255,255,0.08)"}`, background: difficulty === d.value ? d.color + "0.12)" : "rgba(255,255,255,0.03)", color: difficulty === d.value ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: 800, fontSize: "11px", fontFamily: "Nunito, sans-serif" }}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: "6px", fontSize: "10px", color: "var(--text-secondary)" }}>
                                Current theme: <span style={{ fontWeight: 800, color: "var(--accent-light)" }}>{resolvedTheme}</span>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                                <div style={{ fontWeight: 800, fontSize: "13px" }}>Quick notes</div>
                                <button onClick={() => setNotes("")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-secondary)", borderRadius: "999px", padding: "2px 8px", cursor: "pointer", fontSize: "10px", fontWeight: 700, fontFamily: "Nunito, sans-serif" }}>Clear</button>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="input-field"
                                rows={3}
                                placeholder="Study reminders, key formulas..."
                                style={{ resize: "vertical", fontSize: "12px", lineHeight: 1.4, padding: "8px 10px", borderRadius: "10px" }}
                            />
                            <div style={{ marginTop: "4px", fontSize: "10px", color: "var(--text-secondary)" }}>Saved locally in this browser.</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Navbar() {
    const { data: session } = useSession();

    return (
        <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="navbar"
        >
            <div className="navbar-container">
                <Link href="/" className="navbar-logo-link">
                    <div className="navbar-logo-wrapper flex items-center gap-2">
                        <div className="navbar-logo-icon flex items-center justify-center p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <span className="navbar-logo-text font-black text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                            QuizAI
                        </span>
                    </div>
                </Link>

                <div className="navbar-actions">
                    {session ? (
                        <>
                            <Link href="/upload" className="navbar-link">
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="navbar-btn-action flex items-center gap-1.5"
                                >
                                    <Plus className="w-4 h-4 text-violet-400" />
                                    <span className="navbar-btn-text">New Quiz</span>
                                </motion.button>
                            </Link>
                            <Link href="/dashboard" className="navbar-link">
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="navbar-btn-action flex items-center gap-1.5"
                                >
                                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                                    <span className="navbar-btn-text">Dashboard</span>
                                </motion.button>
                            </Link>
                             <div className="navbar-user-badge flex items-center gap-2 border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 rounded-full backdrop-blur-sm">
                                 <div className="navbar-user-avatar w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-500/10">
                                     {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
                                 </div>
                                 <span className="navbar-user-name text-sm font-medium text-[var(--text-primary)]/90">
                                     {session.user?.name || session.user?.email}
                                 </span>
                             </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="navbar-link">
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-secondary navbar-auth-btn flex items-center gap-1.5"
                                >
                                    <LogIn className="w-4 h-4 text-indigo-400" />
                                    Login
                                </motion.button>
                            </Link>
                            <Link href="/register" className="navbar-link">
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-primary navbar-auth-btn flex items-center gap-1.5"
                                >
                                    <Rocket className="w-4 h-4" />
                                    <span className="navbar-btn-text">Get Started</span>
                                </motion.button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
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
