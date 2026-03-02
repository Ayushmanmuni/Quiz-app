import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { quizId, answers, score, totalQuestions } = await req.json();

        if (!quizId || answers === undefined || score === undefined || !totalQuestions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const attempt = await prisma.quizAttempt.create({
            data: {
                userId: session.user.id,
                quizId,
                score,
                totalQuestions,
                answers: JSON.stringify(answers),
            },
        });

        return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
    } catch (error) {
        console.error("Save attempt error:", error);
        return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
    }
}
