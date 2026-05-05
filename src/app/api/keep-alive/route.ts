import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// GET /api/keep-alive — Ping Supabase to prevent free-tier sleep
export async function GET() {
    try {
        const { count, error } = await getSupabase()
            .from("users")
            .select("id", { count: "exact", head: true });

        if (error) {
            return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
        }

        return NextResponse.json({
            status: "alive",
            timestamp: new Date().toISOString(),
            userCount: count,
        });
    } catch (err) {
        return NextResponse.json({ status: "error", message: String(err) }, { status: 500 });
    }
}
