"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageBackground } from "@/components/ui/page-background";
import { GlassCardStrong } from "@/components/ui/glass-card";
import { Mail, Lock, ArrowRight, ShieldAlert, Sparkles, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative min-h-[calc(100vh-70px)]">
            <PageBackground variant="auth" />
            <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-70px)] px-6 py-12">
                <GlassCardStrong className="w-full max-w-[440px] p-8 md:p-10 border-white/[0.08]" hover={false} delay={0.1}>
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-rose-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20"
                            role="img"
                            aria-hidden="true"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl md:text-3xl font-black mb-2 text-[var(--text-primary)]">Login to QuizAI</h1>
                        <p className="text-sm text-[var(--text-secondary)] font-semibold">Sign in to continue to your dashboard</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            role="alert"
                            aria-live="polite"
                            aria-atomic="true"
                            className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 text-sm text-rose-400 flex items-start gap-2.5 font-semibold"
                        >
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        role="form"
                        aria-label="Login form"
                        noValidate
                        className="flex flex-col gap-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider"
                            >
                                Email Address <span aria-label="required" className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-indigo-400/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    className="input-field input-field-icon-left"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    id="email"
                                    aria-required="true"
                                    aria-describedby="email-hint"
                                />
                            </div>
                            <p id="email-hint" className="text-[11px] text-[var(--text-secondary)] mt-1.5 ml-1">
                                Enter your registered email address
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider"
                            >
                                Password <span aria-label="required" className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock className="w-5 h-5 text-indigo-400/50 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input-field input-field-icon-left input-field-icon-right"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    id="password"
                                    aria-required="true"
                                    aria-describedby="password-hint"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/50 hover:text-indigo-400 focus:outline-none transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p id="password-hint" className="text-[11px] text-[var(--text-secondary)] mt-1.5 ml-1">
                                Your password is case-sensitive
                            </p>
                        </div>
                        
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full justify-center py-3.5 mt-2 flex items-center gap-2 text-base font-bold shadow-lg shadow-indigo-500/20"
                            disabled={loading}
                            aria-busy={loading}
                            aria-label={loading ? "Logging in..." : "Login to your account"}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Login</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="divider my-6 border-t border-white/[0.08]" />
                    
                    <p className="text-center text-sm text-[var(--text-secondary)] font-semibold">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="text-[var(--accent)] hover:underline font-extrabold transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </GlassCardStrong>
            </div>
        </div>
    );
}
