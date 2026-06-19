"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function GlassCard({
    children,
    className,
    delay = 0,
    hover = true,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            }}
            whileHover={
                hover
                    ? {
                          y: -4,
                          transition: { duration: 0.25 },
                      }
                    : undefined
            }
            className={cn(
                "relative rounded-2xl overflow-hidden",
                "bg-gradient-to-b from-white/[0.05] to-white/[0.01] [.theme-light_&]:from-white/[0.75] [.theme-light_&]:to-white/[0.45]",
                "backdrop-blur-xl",
                "border border-white/[0.08] [.theme-light_&]:border-blue-900/[0.08]",
                "shadow-[0_0_20px_rgba(0,229,255,0.05),_0_0_20px_rgba(255,46,99,0.05)] [.theme-light_&]:shadow-[0_12px_40px_rgba(30,64,175,0.04)]",
                hover && "hover:border-cyan-400/[0.3] [.theme-light_&]:hover:border-blue-500/[0.2] hover:shadow-[0_0_30px_rgba(0,229,255,0.18),_0_0_30px_rgba(255,46,99,0.12)] [.theme-light_&]:hover:shadow-[0_20px_50px_rgba(30,64,175,0.08)]",
                "transition-all duration-300",
                className
            )}
        >
            {/* Top edge glossy highlight overlay for liquid glass look */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)] [.theme-light_&]:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.04),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}

function GlassCardStrong({
    children,
    className,
    delay = 0,
    hover = false,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    hover?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            }}
            whileHover={
                hover
                    ? {
                          y: -4,
                          transition: { duration: 0.25 },
                      }
                    : undefined
            }
            className={cn(
                "relative rounded-3xl overflow-hidden",
                "bg-gradient-to-b from-white/[0.07] to-white/[0.02] [.theme-light_&]:from-white/[0.85] [.theme-light_&]:to-white/[0.55] backdrop-blur-2xl",
                "border border-white/[0.1] [.theme-light_&]:border-blue-900/[0.1]",
                "shadow-[0_0_35px_rgba(0,229,255,0.08),_0_0_35px_rgba(255,46,99,0.08)] [.theme-light_&]:shadow-[0_20px_50px_rgba(30,64,175,0.06)]",
                hover && "hover:border-cyan-400/[0.3] [.theme-light_&]:hover:border-blue-500/[0.2] hover:shadow-[0_0_40px_rgba(0,229,255,0.22),_0_0_40px_rgba(255,46,99,0.15)] [.theme-light_&]:hover:shadow-[0_24px_60px_rgba(30,64,175,0.08)]",
                "transition-all duration-300",
                className
            )}
        >
            {/* Top edge glossy highlight overlay for liquid glass look */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_50%)] [.theme-light_&]:bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.05),transparent_50%)] pointer-events-none" />
            <div className="relative z-10 h-full">{children}</div>
        </motion.div>
    );
}

export { GlassCard, GlassCardStrong };
