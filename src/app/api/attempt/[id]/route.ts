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

        const attempt = await prisma.quizAttempt.findUnique({
            where: { id },
        });

        if (!attempt) {
            return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
        }

        return NextResponse.json(attempt);
    } catch (error) {
        console.error("Get attempt error:", error);
        return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 });
    }
}
