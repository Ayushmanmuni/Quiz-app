import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const quiz = await prisma.quiz.findUnique({
            where: { id },
            include: {
                questions: { orderBy: { order: "asc" } },
                user: { select: { name: true, email: true } },
            },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Get quiz error:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}
