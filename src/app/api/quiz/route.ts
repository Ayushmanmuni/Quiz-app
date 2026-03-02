import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, generateQuizQuestions } from "@/lib";

// POST — Generate quiz (handles both text upload + AI generation)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contentType = req.headers.get("content-type") || "";

        // Handle file upload
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json({ error: "No file provided" }, { status: 400 });
            }

            const allowedTypes = ["text/plain", "application/pdf", "text/markdown"];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: "Only .txt and .pdf files are supported" }, { status: 400 });
            }

            let text = "";
            if (file.type === "application/pdf") {
                const buffer = Buffer.from(await file.arrayBuffer());
                const pdfParse = (await import("pdf-parse")).default;
                const data = await pdfParse(buffer);
                text = data.text;
            } else {
                text = await file.text();
            }

            if (text.trim().length < 100) {
                return NextResponse.json({ error: "File content too short. Need at least 100 characters." }, { status: 400 });
            }

            return NextResponse.json({ text: text.substring(0, 10000) });
        }

        // Handle quiz generation from text
        const { text, difficulty, numQuestions, title } = await req.json();

        if (!text || text.trim().length < 100) {
            return NextResponse.json({ error: "Please provide at least 100 characters of text content" }, { status: 400 });
        }
        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
        }

        const count = Math.min(Math.max(parseInt(numQuestions) || 10, 5), 20);
        const questions = await generateQuizQuestions(text, difficulty, count);

        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 });
        }

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
        console.error("Quiz API error:", msg);
        return NextResponse.json({ error: `Quiz operation failed: ${msg}` }, { status: 500 });
    }
}

// GET — Fetch quiz by id (?id=xxx)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Quiz ID required" }, { status: 400 });
        }

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
