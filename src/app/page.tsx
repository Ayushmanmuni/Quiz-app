"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { AnimatedSection } from "@/components/ui/animated-section";
import { GlassCard } from "@/components/ui/glass-card";
import { PageBackground } from "@/components/ui/page-background";
import { 
    Sparkles, 
    FileText, 
    Brain, 
    Target, 
    BarChart2, 
    Lightbulb, 
    Zap, 
    ArrowRight, 
    CheckCircle2,
    Plus,
    LayoutDashboard,
    Rocket,
    LogIn
} from "lucide-react";

export default function HomePage() {
    const { data: session } = useSession();

    const features = [
        { 
            icon: <FileText className="w-6 h-6 text-violet-400" />, 
            title: "Upload Any Document", 
            desc: "Paste text or upload PDF/TXT files. Our AI understands your content instantly.", 
            color: "violet" 
        },
        { 
            icon: <Brain className="w-6 h-6 text-sky-400" />, 
            title: "AI Question Generation", 
            desc: "Hugging Face AI extracts key concepts and creates perfect MCQs automatically.", 
            color: "sky" 
        },
        { 
            icon: <Target className="w-6 h-6 text-amber-400" />, 
            title: "3 Difficulty Levels", 
            desc: "Easy, Medium, or Hard — tailored to your learning needs and pace.", 
            color: "amber" 
        },
        { 
            icon: <BarChart2 className="w-6 h-6 text-emerald-400" />, 
            title: "Track Your Progress", 
            desc: "Every score is saved. Monitor improvement over time on your dashboard.", 
            color: "teal" 
        },
        { 
            icon: <Lightbulb className="w-6 h-6 text-pink-400" />, 
            title: "Detailed Explanations", 
            desc: "Learn why each answer is correct with AI-generated explanations.", 
            color: "pink" 
        },
        { 
            icon: <Zap className="w-6 h-6 text-rose-400" />, 
            title: "Instant Results", 
            desc: "Generate a 10-question quiz in seconds. Study smarter, not harder.", 
            color: "coral" 
        },
    ];

    const steps = [
        { 
            num: "01", 
            title: "Upload Content", 
            desc: "Paste your text or upload a document", 
            icon: <FileText className="w-5 h-5 text-sky-400" />, 
            color: "rgba(56,189,248,0.1)", 
            border: "rgba(56,189,248,0.2)" 
        },
        { 
            num: "02", 
            title: "AI Generates Quiz", 
            desc: "AI creates targeted MCQs instantly", 
            icon: <Brain className="w-5 h-5 text-violet-400" />, 
            color: "rgba(139,92,246,0.1)", 
            border: "rgba(139,92,246,0.2)" 
        },
        { 
            num: "03", 
            title: "Take the Quiz", 
            desc: "Answer questions at your own pace", 
            icon: <Zap className="w-5 h-5 text-amber-400" />, 
            color: "rgba(251,191,36,0.1)", 
            border: "rgba(251,191,36,0.2)" 
        },
        { 
            num: "04", 
            title: "Review & Learn", 
            desc: "See explanations for every answer", 
            icon: <Target className="w-5 h-5 text-emerald-400" />, 
            color: "rgba(52,211,153,0.1)", 
            border: "rgba(52,211,153,0.2)" 
        },
    ];

    return (
        <div className="relative">
            <PageBackground variant="default" />
            <HeroGeometric
                badge="Powered by Hugging Face AI"
                title1="Turn Any Document Into"
                title2="An AI-Powered Quiz"
                description="Upload text, PDFs, or study notes — our AI instantly creates personalized multiple-choice quizzes with detailed explanations."
            >
                <div className="flex gap-4 justify-center flex-wrap mt-4">
                    {session ? (
                        <>
                            <Link href="/upload">
                                <button className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
                                    <Plus className="w-5 h-5" />
                                    Create New Quiz
                                </button>
                            </Link>
                            <Link href="/dashboard">
                                <button className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
                                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                                    Dashboard
                                </button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/register">
                                <button className="btn-primary flex items-center gap-2 text-base px-8 py-3.5">
                                    <Rocket className="w-5 h-5" />
                                    Start for Free
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="btn-secondary flex items-center gap-2 text-base px-8 py-3.5">
                                    <LogIn className="w-5 h-5 text-indigo-400" />
                                    Login
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </HeroGeometric>

            {/* How It Works */}
            <section className="max-w-[1100px] mx-auto px-6 py-20 relative z-10">
                <AnimatedSection className="text-center mb-16" direction="up">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[var(--text-primary)]">
                        How it <span className="gradient-text-blue">works</span> <Sparkles className="w-6 h-6 inline-block text-indigo-300 ml-1.5 animate-pulse" />
                    </h2>
                    <p className="text-base text-[var(--text-secondary)] font-medium">
                        From document to quiz in under 30 seconds
                    </p>
                </AnimatedSection>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <AnimatedSection key={i} delay={i * 0.1} direction="up">
                            <GlassCard className="h-full p-7 overflow-hidden border-white/[0.08]" hover={true}>
                                <div className="absolute top-4 right-4 text-4xl font-mono font-bold opacity-10 pointer-events-none select-none">
                                    {step.num}
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border"
                                    style={{ background: step.color, borderColor: step.border }}
                                >
                                    {step.icon}
                                </div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{step.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </GlassCard>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="max-w-[1100px] mx-auto px-6 py-10 md:py-20 relative z-10">
                <AnimatedSection className="text-center mb-16" direction="up">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[var(--text-primary)]">
                        Everything you <span className="gradient-text">need to learn</span>
                    </h2>
                </AnimatedSection>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <AnimatedSection key={i} delay={i * 0.1} direction="up">
                            <GlassCard className="h-full p-7 flex flex-col gap-4 border-white/[0.08]" hover={true}>
                                <div className={`icon-circle icon-circle-${f.color} flex items-center justify-center w-12 h-12 rounded-full`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">{f.title}</h3>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                                    {f.desc}
                                </p>
                            </GlassCard>
                        </AnimatedSection>
                    ))}
                </div>
            </section>

            {/* Stats strip */}
            <section className="max-w-[1100px] mx-auto px-6 pb-20 relative z-10">
                <AnimatedSection direction="up">
                    <div className="glass grid grid-cols-2 md:grid-cols-4 gap-8 text-center p-8 md:p-10 border-white/[0.08]">
                        {[
                            { val: "10s", label: "Quiz generated", icon: <Zap className="w-5 h-5 mx-auto mb-2 text-rose-400" /> },
                            { val: "3", label: "Difficulty levels", icon: <Target className="w-5 h-5 mx-auto mb-2 text-amber-400" /> },
                            { val: "∞", label: "Topics supported", icon: <Brain className="w-5 h-5 mx-auto mb-2 text-sky-400" /> },
                            { val: "100%", label: "Free to use", icon: <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-emerald-400" /> },
                        ].map((s, i) => (
                            <div key={i} className="flex flex-col items-center">
                                {s.icon}
                                <div className="text-3xl md:text-4xl font-black mb-1 gradient-text">{s.val}</div>
                                <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>
            </section>

            {/* CTA */}
            <section className="max-w-[700px] mx-auto px-6 pb-24 text-center relative z-10">
                <AnimatedSection direction="up">
                    <div className="glass-strong p-8 md:p-12 border-white/[0.08] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] opacity-50" />
                        <div className="text-5xl mb-6 flex justify-center">
                            <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-[var(--text-primary)] relative z-10">
                            {session ? "Ready to test your knowledge?" : "Ready to level up your learning?"}
                        </h2>
                        <p className="text-sm md:text-base text-[var(--text-secondary)] mb-8 font-medium max-w-lg mx-auto relative z-10">
                            {session ? "Create a new quiz from any topic or document. Let's go!" : "Join and start generating AI-powered quizzes today. Free forever!"}
                        </p>
                        <Link href={session ? "/upload" : "/register"} className="relative z-10 inline-block">
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="btn-primary flex items-center gap-2 text-base px-8 py-3.5 shadow-lg shadow-indigo-500/20"
                            >
                                {session ? "Create New Quiz" : "Create Free Account"}
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </motion.button>
                        </Link>
                    </div>
                </AnimatedSection>
            </section>
        </div>
    );
}
