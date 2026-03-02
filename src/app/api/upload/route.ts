import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const allowedTypes = [
            "text/plain",
            "application/pdf",
            "text/markdown",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Only .txt and .pdf files are supported" },
                { status: 400 }
            );
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
            return NextResponse.json(
                { error: "File content too short. Need at least 100 characters." },
                { status: 400 }
            );
        }

        return NextResponse.json({ text: text.substring(0, 10000) });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}
