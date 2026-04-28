import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export interface GeneratedQuestion {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
    difficulty?: "easy" | "medium" | "hard";
}

export async function generateQuizQuestions(
    text: string,
    difficulty: "easy" | "medium" | "hard",
    numQuestions: number,
    mode: "standard" | "study" | "adaptive" = "standard"
): Promise<GeneratedQuestion[]> {
    const diffMap: Record<string, string> = {
        easy: "Create straightforward questions based on explicit facts.",
        medium: "Create questions requiring understanding and comprehension.",
        hard: "Create challenging questions requiring deep analysis and synthesis.",
    };

    let extraInstructions = "";
    if (mode === "adaptive") {
        const per = Math.ceil(numQuestions / 3);
        extraInstructions = `Generate a MIX of difficulties: ~${per} easy, ~${per} medium, ~${per} hard. Tag each with "difficulty".`;
    } else if (mode === "study") {
        extraInstructions = `Include VERY detailed explanations (2-3 sentences each) so the student can learn from them.`;
    }

    const prompt = `You are an expert quiz maker. Generate exactly ${numQuestions} MCQs at ${difficulty.toUpperCase()} difficulty from the text below.

${diffMap[difficulty]}
${extraInstructions}

TEXT:
"""
${text.substring(0, 6000)}
"""

Return ONLY a valid JSON array. No markdown. No extra text. Format:
[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"...","difficulty":"medium"}]

Rules:
- correctAnswer must be "A", "B", "C", or "D"
- difficulty must be "easy", "medium", or "hard"
- All 4 options plausible, only one correct
- Explanations educational
- Return ONLY the JSON array`;

    return await callAI(prompt);
}

export async function generateTopicQuiz(
    topic: string,
    difficulty: "easy" | "medium" | "hard",
    numQuestions: number,
    mode: "standard" | "study" | "adaptive" = "standard"
): Promise<{ questions: GeneratedQuestion[]; generatedText: string }> {
    let extraInstructions = "";
    if (mode === "adaptive") {
        extraInstructions = `Generate a MIX: some easy, some medium, some hard. Tag each with "difficulty".`;
    } else if (mode === "study") {
        extraInstructions = `Include VERY detailed explanations (2-3 sentences each).`;
    }

    const prompt = `You are an expert teacher and quiz maker. The student wants to learn about: "${topic}".

Step 1: Write a concise 300-word educational summary about "${topic}".
Step 2: Generate exactly ${numQuestions} MCQs at ${difficulty.toUpperCase()} difficulty based on your summary.
${extraInstructions}

Return ONLY a valid JSON object (no markdown):
{"summary":"your 300-word summary here...","questions":[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"...","difficulty":"medium"}]}

Rules:
- correctAnswer must be "A", "B", "C", or "D"
- difficulty must be "easy", "medium", or "hard"
- All 4 options plausible, only one correct
- Return ONLY the JSON object`;

    const models = [
        "Qwen/Qwen2.5-72B-Instruct",
        "meta-llama/Llama-3.3-70B-Instruct",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
    ];

    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const response = await hf.chatCompletion({
                model,
                messages: [
                    { role: "system", content: "You are an expert teacher. Output ONLY valid JSON. No markdown." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 4096,
                temperature: 0.7,
            });

            let text = response.choices[0]?.message?.content?.trim() || "";
            text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

            const objStart = text.indexOf("{");
            const objEnd = text.lastIndexOf("}");
            if (objStart !== -1 && objEnd !== -1) {
                text = text.substring(objStart, objEnd + 1);
            }

            const result = JSON.parse(text);
            if (result.questions?.length > 0) {
                return { questions: result.questions, generatedText: result.summary || "" };
            }
        } catch (err) {
            lastError = err as Error;
            console.error(`Model ${model} failed:`, (err as Error).message);
        }
    }

    throw lastError || new Error("All models failed");
}

async function callAI(prompt: string): Promise<GeneratedQuestion[]> {
    const models = [
        "Qwen/Qwen2.5-72B-Instruct",
        "meta-llama/Llama-3.3-70B-Instruct",
        "mistralai/Mixtral-8x7B-Instruct-v0.1",
    ];

    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const response = await hf.chatCompletion({
                model,
                messages: [
                    { role: "system", content: "You are an expert quiz generator. Output ONLY valid JSON arrays. No markdown." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 4096,
                temperature: 0.7,
            });

            let text = response.choices[0]?.message?.content?.trim() || "";
            text = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

            const arrStart = text.indexOf("[");
            const arrEnd = text.lastIndexOf("]");
            if (arrStart !== -1 && arrEnd !== -1) {
                text = text.substring(arrStart, arrEnd + 1);
            }

            const questions: GeneratedQuestion[] = JSON.parse(text);
            if (questions.length > 0) return questions;
        } catch (err) {
            lastError = err as Error;
            console.error(`Model ${model} failed:`, (err as Error).message);
        }
    }

    throw lastError || new Error("All models failed to generate quiz");
}
