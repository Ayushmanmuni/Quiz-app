import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizQuestions } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { text, difficulty, numQuestions, title } = await req.json();

        if (!text || text.trim().length < 100) {
            return NextResponse.json(
                { error: "Please provide at least 100 characters of text content" },
                { status: 400 }
            );
        }

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
        }

        const count = Math.min(Math.max(parseInt(numQuestions) || 10, 5), 20);

        // Generate questions via Hugging Face AI
        const questions = await generateQuizQuestions(text, difficulty, count);

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                { error: "Failed to generate questions. Please try again." },
                { status: 500 }
            );
        }

        // Save quiz and questions to DB
        const quiz = await prisma.quiz.create({
            data: {
                title: title || `Quiz - ${new Date().toLocaleDateString()}`,
                difficulty,
                sourceText: text.substring(0, 10000),
                userId: session.user.id,
                questions: {
                    create: questions.map((q, i) => ({
                        questionText: q.questionText,
                        optionA: q.optionA,
                        optionB: q.optionB,
                        optionC: q.optionC,
                        optionD: q.optionD,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        order: i,
                    })),
                },
            },
            include: { questions: true },
        });

        return NextResponse.json({ quizId: quiz.id }, { status: 201 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("Generate quiz error:", msg);
        return NextResponse.json(
            { error: `Quiz generation failed: ${msg}` },
            { status: 500 }
        );
    }
}
