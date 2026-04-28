import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateQuizQuestions, generateTopicQuiz } from "@/lib";
import { supabase } from "../../../../lib/supabase";

// POST — Generate quiz (file upload, text, or topic-based)
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
        const { data: quiz, error: quizError } = await supabase
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
            console.error("Quiz create error:", quizError);
            return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
        }

        // Insert questions
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

        const { error: qError } = await supabase.from("questions").insert(questionRows);

        if (qError) {
            console.error("Questions insert error:", qError);
            return NextResponse.json({ error: "Failed to save questions" }, { status: 500 });
        }

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

        const { data: quiz, error } = await supabase
            .from("quizzes")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        const { data: questions } = await supabase
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
        console.error("Get quiz error:", error);
        return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
    }
}
