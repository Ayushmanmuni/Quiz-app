import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const attempts = await prisma.quizAttempt.findMany({
            where: { userId: session.user.id },
            include: {
                quiz: { select: { title: true, difficulty: true } },
            },
            orderBy: { completedAt: "desc" },
        });

        return NextResponse.json(attempts);
    } catch (error) {
        console.error("Dashboard error:", error);
        return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
    }
}
