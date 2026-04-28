import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Nunito", "sans-serif"],
            },
            colors: {
                brand: {
                    50:  "#F5F0FF",
                    100: "#EDE0FF",
                    200: "#D4B8FF",
                    300: "#BB90FF",
                    400: "#A78BFA",
                    500: "#8B5CF6",
                    600: "#7C3AED",
                    700: "#6D28D9",
                    800: "#5B21B6",
                    900: "#4C1D95",
                },
                fun: {
                    pink:  "#EC4899",
                    sky:   "#38BDF8",
                    amber: "#FBBF24",
                    teal:  "#34D399",
                    coral: "#F87171",
                },
                dark: {
                    900: "#0E0B1A",
                    800: "#15112A",
                    700: "#1C1740",
                    600: "#22205A",
                    500: "#2A2870",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-brand":  "linear-gradient(135deg, #8B5CF6, #EC4899)",
                "gradient-fun":    "linear-gradient(135deg, #38BDF8, #8B5CF6, #EC4899)",
            },
            animation: {
                "fade-in":   "fadeIn 0.5s ease-in-out",
                "slide-up":  "slideUp 0.4s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                float:       "float 5s ease-in-out infinite",
                pop:         "pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
                wiggle:      "wiggle 0.5s ease",
            },
            keyframes: {
                fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
                float:   { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
                pop:     { "0%": { transform: "scale(0.5)", opacity: "0" }, "70%": { transform: "scale(1.15)", opacity: "1" }, "100%": { transform: "scale(1)", opacity: "1" } },
                wiggle:  { "0%, 100%": { transform: "rotate(0deg)" }, "25%": { transform: "rotate(-8deg)" }, "75%": { transform: "rotate(8deg)" } },
            },
        },
    },
    plugins: [],
};
export default config;
