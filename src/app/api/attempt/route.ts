import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib";

// POST — Submit quiz attempt
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

// GET — Fetch attempt by id (?id=xxx) or all user attempts for dashboard (no params)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");

        if (id) {
            // Single attempt
            const attempt = await prisma.quizAttempt.findUnique({ where: { id } });
            if (!attempt) {
                return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
            }
            return NextResponse.json(attempt);
        }

        // All attempts for dashboard
        const attempts = await prisma.quizAttempt.findMany({
            where: { userId: session.user.id },
            include: { quiz: { select: { title: true, difficulty: true } } },
            orderBy: { completedAt: "desc" },
        });

        return NextResponse.json(attempts);
    } catch (error) {
        console.error("Attempt API error:", error);
        return NextResponse.json({ error: "Failed to fetch attempt(s)" }, { status: 500 });
    }
}
