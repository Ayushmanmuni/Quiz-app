import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "QuizAI — AI-Powered Quiz Generator",
    description:
        "Upload any document or text and let AI generate personalized MCQ quizzes with detailed explanations. Track your progress and improve your knowledge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={nunito.className} suppressHydrationWarning>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
