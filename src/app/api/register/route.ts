import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const { data: existing } = await getSupabase()
            .from("users")
            .select("id")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data: user, error } = await getSupabase()
            .from("users")
            .insert({ name, email, password: hashedPassword })
            .select("id, name, email")
            .single();

        if (error) {
            console.error("Register error:", error);
            return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
        }

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }
}
