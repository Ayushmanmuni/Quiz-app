import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabase } from "@/lib/supabase";

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

        const { data: attempt, error } = await getSupabase()
            .from("quiz_attempts")
            .insert({
                user_id: session.user.id,
                quiz_id: quizId,
                score,
                total_questions: totalQuestions,
                answers: typeof answers === "string" ? JSON.parse(answers) : answers,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Save attempt error:", error);
            return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
        }

        return NextResponse.json({ attemptId: attempt.id }, { status: 201 });
    } catch (error) {
        console.error("Save attempt error:", error);
        return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
    }
}

// GET — Fetch attempt by id (?id=xxx) or all user attempts for dashboard
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = req.nextUrl.searchParams.get("id");

        if (id) {
            const { data: attempt, error } = await getSupabase()
                .from("quiz_attempts")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !attempt) {
                return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
            }

            return NextResponse.json({
                ...attempt,
                answers: JSON.stringify(attempt.answers),
                completedAt: attempt.completed_at,
                totalQuestions: attempt.total_questions,
            });
        }

        // All attempts for dashboard
        const { data: attempts, error } = await getSupabase()
            .from("quiz_attempts")
            .select("*, quizzes(title, difficulty, mode)")
            .eq("user_id", session.user.id)
            .order("completed_at", { ascending: false });

        if (error) {
            console.error("Dashboard error:", error);
            return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
        }

        // Map for frontend compatibility
        const mapped = (attempts || []).map((a: Record<string, unknown>) => ({
            id: a.id,
            score: a.score,
            totalQuestions: a.total_questions,
            completedAt: a.completed_at,
            quizId: a.quiz_id,
            quiz: a.quizzes || { title: "Unknown", difficulty: "medium", mode: "standard" },
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Attempt API error:", error);
        return NextResponse.json({ error: "Failed to fetch attempt(s)" }, { status: 500 });
    }
}
