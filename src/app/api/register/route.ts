import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });

        return NextResponse.json({ message: "Account created successfully", userId: user.id }, { status: 201 });
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
