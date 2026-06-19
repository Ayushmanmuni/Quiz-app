"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
            animate={{ opacity: 1, y: 0, rotate }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96] as [number, number, number, number],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{ width, height }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-white/[0.12] [.theme-light_&]:border-indigo-950/[0.06]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] [.theme-light_&]:shadow-[0_8px_32px_0_rgba(139,92,246,0.04)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)] [.theme-light_&]:after:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

type Variant = "default" | "auth" | "create" | "quiz" | "results" | "dashboard";

const variantShapes: Record<
    Variant,
    Array<{
        delay: number;
        width: number;
        height: number;
        rotate: number;
        gradient: string;
        className: string;
    }>
> = {
    default: [
        { delay: 0.3, width: 400, height: 100, rotate: 12, gradient: "from-indigo-500/[0.12]", className: "left-[-10%] top-[20%]" },
        { delay: 0.5, width: 350, height: 90, rotate: -15, gradient: "from-rose-500/[0.12]", className: "right-[-5%] top-[70%]" },
        { delay: 0.7, width: 200, height: 50, rotate: -8, gradient: "from-violet-500/[0.1]", className: "left-[10%] bottom-[10%]" },
    ],
    auth: [
        { delay: 0.2, width: 450, height: 110, rotate: 15, gradient: "from-violet-500/[0.12]", className: "left-[-15%] md:left-[-8%] top-[10%] md:top-[15%]" },
        { delay: 0.4, width: 350, height: 90, rotate: -12, gradient: "from-rose-500/[0.1]", className: "right-[-8%] md:right-[-3%] bottom-[15%] md:bottom-[20%]" },
        { delay: 0.6, width: 180, height: 50, rotate: 20, gradient: "from-indigo-500/[0.1]", className: "right-[20%] top-[8%]" },
    ],
    create: [
        { delay: 0.2, width: 500, height: 120, rotate: 10, gradient: "from-indigo-500/[0.14]", className: "left-[-12%] md:left-[-6%] top-[12%] md:top-[18%]" },
        { delay: 0.4, width: 400, height: 100, rotate: -18, gradient: "from-amber-500/[0.12]", className: "right-[-8%] md:right-[-2%] top-[65%] md:top-[72%]" },
        { delay: 0.5, width: 250, height: 65, rotate: -6, gradient: "from-violet-500/[0.1]", className: "left-[8%] md:left-[14%] bottom-[5%] md:bottom-[8%]" },
        { delay: 0.7, width: 150, height: 40, rotate: 25, gradient: "from-cyan-500/[0.1]", className: "right-[18%] top-[6%]" },
    ],
    quiz: [
        { delay: 0.3, width: 380, height: 95, rotate: 8, gradient: "from-indigo-500/[0.1]", className: "left-[-12%] top-[18%]" },
        { delay: 0.5, width: 300, height: 75, rotate: -14, gradient: "from-violet-500/[0.1]", className: "right-[-6%] bottom-[20%]" },
        { delay: 0.7, width: 160, height: 42, rotate: 18, gradient: "from-rose-500/[0.08]", className: "right-[22%] top-[8%]" },
    ],
    results: [
        { delay: 0.2, width: 500, height: 120, rotate: 14, gradient: "from-emerald-500/[0.14]", className: "left-[-14%] md:left-[-7%] top-[12%] md:top-[18%]" },
        { delay: 0.4, width: 420, height: 105, rotate: -16, gradient: "from-amber-500/[0.12]", className: "right-[-8%] md:right-[-2%] top-[60%] md:top-[68%]" },
        { delay: 0.5, width: 280, height: 70, rotate: -10, gradient: "from-violet-500/[0.12]", className: "left-[6%] md:left-[12%] bottom-[6%] md:bottom-[10%]" },
        { delay: 0.65, width: 180, height: 48, rotate: 22, gradient: "from-rose-500/[0.1]", className: "right-[16%] top-[6%]" },
    ],
    dashboard: [
        { delay: 0.2, width: 480, height: 115, rotate: 11, gradient: "from-indigo-500/[0.12]", className: "left-[-14%] md:left-[-6%] top-[10%] md:top-[16%]" },
        { delay: 0.4, width: 380, height: 95, rotate: -13, gradient: "from-cyan-500/[0.1]", className: "right-[-6%] md:right-[0%] top-[65%] md:top-[72%]" },
        { delay: 0.6, width: 200, height: 55, rotate: -7, gradient: "from-violet-500/[0.1]", className: "left-[8%] bottom-[8%]" },
        { delay: 0.7, width: 140, height: 38, rotate: 20, gradient: "from-amber-500/[0.08]", className: "right-[20%] top-[5%]" },
    ],
};

function PageBackground({ variant = "default" }: { variant?: Variant }) {
    const shapes = variantShapes[variant];

    return (
        <>
            <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] [.theme-light_&]:from-blue-500/[0.09] [.theme-light_&]:to-red-500/[0.09] blur-3xl pointer-events-none" />
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {shapes.map((shape, i) => (
                    <ElegantShape key={i} {...shape} />
                ))}
            </div>
            <div className="fixed inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]/80 pointer-events-none" />
        </>
    );
}

export { PageBackground, ElegantShape };
