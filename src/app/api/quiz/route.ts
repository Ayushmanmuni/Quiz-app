import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateQuizQuestions, generateTopicQuiz } from "@/lib";
import { getSupabase } from "@/lib/supabase";
import logger from "@/logger";
import { trackEvent } from "@/monitoring";
import { checkRateLimit, createRateLimitResponse } from "@/middleware/rateLimit";

// POST — Generate quiz (file upload, text, or topic-based)
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limit per user to protect heavy model usage
        const userKey = `quiz:${session.user.id}`;
        const rateLimitCheck = await checkRateLimit(req, userKey);
        if (!rateLimitCheck.allowed) {
            return createRateLimitResponse(rateLimitCheck.retryAfter);
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

            const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
            if (typeof (file as any).size === "number" && (file as any).size > MAX_FILE_BYTES) {
                return NextResponse.json({ error: "File too large. Max 5MB allowed." }, { status: 413 });
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

        // Handle JSON body (text-based or topic-based quiz generation)
        const body = await req.json();
        const { text, topic, difficulty, numQuestions, title, mode = "standard", source = "text" } = body;

        if (!["easy", "medium", "hard"].includes(difficulty)) {
            return NextResponse.json({ error: "Invalid difficulty" }, { status: 400 });
        }

        const count = Math.min(Math.max(parseInt(numQuestions) || 10, 5), 20);
        let questions;
        let sourceText: string;

        // Topic-based quiz generation
        if (source === "topic" && topic) {
            const result = await generateTopicQuiz(topic, difficulty, count, mode);
            questions = result.questions;
            sourceText = result.generatedText || `Topic: ${topic}`;
        } else {
            // Text-based quiz generation
            if (!text || text.trim().length < 100) {
                return NextResponse.json({ error: "Please provide at least 100 characters of text content" }, { status: 400 });
            }
            questions = await generateQuizQuestions(text, difficulty, count, mode);
            sourceText = text.substring(0, 10000);
        }

        if (!questions || questions.length === 0) {
            return NextResponse.json({ error: "Failed to generate questions. Please try again." }, { status: 500 });
        }

        // Create quiz in Supabase
        const { data: quiz, error: quizError } = await getSupabase()
            .from("quizzes")
            .insert({
                title: title || (topic ? `${topic} Quiz` : `Quiz - ${new Date().toLocaleDateString()}`),
                difficulty,
                mode,
                source,
                topic: topic || null,
                source_text: sourceText,
                user_id: session.user.id,
            })
            .select("id")
            .single();

        if (quizError || !quiz) {
            logger.error("Quiz create error:", quizError);
            trackEvent(
                "quiz_create_failed",
                {
                    userId: session.user.id,
                    difficulty,
                    mode,
                    source,
                    error: quizError?.message,
                },
                "error",
            );
            return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
        }

        // Insert questions. If inserting questions fails, delete the created quiz to avoid orphaned quizzes.
        const questionRows = questions.map((q, i) => ({
            quiz_id: quiz.id,
            question_text: q.questionText,
            option_a: q.optionA,
            option_b: q.optionB,
            option_c: q.optionC,
            option_d: q.optionD,
            correct_answer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty || difficulty,
            sort_order: i,
        }));

        const { error: qError } = await getSupabase().from("questions").insert(questionRows);

        if (qError) {
            logger.error("Questions insert error:", qError);
            trackEvent(
                "quiz_questions_insert_failed",
                {
                    quizId: quiz.id,
                    userId: session.user.id,
                    questionCount: questions.length,
                    error: qError.message,
                },
                "error",
            );
            try {
                await getSupabase().from("quizzes").delete().eq("id", quiz.id);
            } catch (delErr) {
                logger.error("Failed to delete orphan quiz:", delErr);
            }
            return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
        }

        trackEvent("quiz_created", {
            quizId: quiz.id,
            userId: session.user.id,
            difficulty,
            mode,
            source,
            questionCount: questions.length,
        });

        return NextResponse.json({ quizId: quiz.id }, { status: 201 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error("Quiz API error:", msg);
        trackEvent("quiz_api_exception", { error: msg }, "error");
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

        const { data: quiz, error } = await getSupabase()
            .from("quizzes")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        const { data: questions } = await getSupabase()
            .from("questions")
            .select("*")
            .eq("quiz_id", id)
            .order("sort_order", { ascending: true });

        // Map snake_case → camelCase for frontend
        const mapped = {
            id: quiz.id,
            title: quiz.title,
            difficulty: quiz.difficulty,
            mode: quiz.mode,
            source: quiz.source,
            topic: quiz.topic,
            sourceText: quiz.source_text,
            createdAt: quiz.created_at,
            questions: (questions || []).map((q: Record<string, unknown>) => ({
                id: q.id,
                questionText: q.question_text,
                optionA: q.option_a,
                optionB: q.option_b,
                optionC: q.option_c,
                optionD: q.option_d,
                correctAnswer: q.correct_answer,
                explanation: q.explanation,
                difficulty: q.difficulty,
                order: q.sort_order,
            })),
        };

        return NextResponse.json(mapped);
    } catch (error) {
        logger.error("Get quiz error:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}
