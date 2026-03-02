import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "QuizAI — AI-Powered Quiz Generator",
    description:
        "Upload any document or text and let AI generate personalized MCQ quizzes with detailed explanations. Track your progress and improve your knowledge.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-dark-900 text-white min-h-screen`}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
