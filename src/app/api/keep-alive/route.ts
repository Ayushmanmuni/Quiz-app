import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { trackEvent } from "@/monitoring";

// GET /api/keep-alive — Ping Supabase to prevent free-tier sleep
export async function GET() {
    const startedAt = Date.now();

    try {
        const { count, error } = await getSupabase()
            .from("users")
            .select("id", { count: "exact", head: true });

        if (error) {
            trackEvent("keep_alive_error", { error: error.message }, "error");
            return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
        }

        trackEvent("keep_alive_success", { userCount: count, durationMs: Date.now() - startedAt });

        return NextResponse.json({
            status: "alive",
            timestamp: new Date().toISOString(),
            userCount: count,
        });
    } catch (err) {
        trackEvent(
            "keep_alive_exception",
            { error: err instanceof Error ? err.message : String(err), durationMs: Date.now() - startedAt },
            "error",
        );
        return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
    }
}
