import { HfInference } from "@huggingface/inference";

// Hugging Face — Free Serverless Inference API
const hf = new HfInference(process.env.HF_TOKEN);

export interface GeneratedQuestion {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
}

export async function generateQuizQuestions(
    text: string,
    difficulty: "easy" | "medium" | "hard",
    numQuestions: number
): Promise<GeneratedQuestion[]> {
    const difficultyInstructions = {
        easy: "Create straightforward questions based on explicit facts in the text.",
        medium: "Create questions requiring understanding and comprehension. Mix factual and inferential.",
        hard: "Create challenging questions requiring deep analysis and synthesis.",
    };

    const prompt = `You are an expert quiz maker. Generate exactly ${numQuestions} MCQs at ${difficulty.toUpperCase()} difficulty from the text below.

${difficultyInstructions[difficulty]}

TEXT:
"""
${text.substring(0, 6000)}
"""

Return ONLY a valid JSON array. No markdown. No extra text. Format:
[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"..."}]

Rules:
- correctAnswer must be "A", "B", "C", or "D"
- All 4 options plausible, only one correct
- Explanations educational
- Questions from the text only
- Return ONLY the JSON array`;

    // Try multiple models in case one is unavailable
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
                    {
                        role: "system",
                        content: "You are an expert quiz generator. Output ONLY valid JSON arrays. No markdown.",
                    },
                    { role: "user", content: prompt },
                ],
                max_tokens: 4096,
                temperature: 0.7,
            });

            let responseText = response.choices[0]?.message?.content?.trim() || "";

            // Clean markdown fences
            responseText = responseText
                .replace(/```json\n?/gi, "")
                .replace(/```\n?/g, "")
                .trim();

            // Extract JSON array
            const arrayStart = responseText.indexOf("[");
            const arrayEnd = responseText.lastIndexOf("]");
            if (arrayStart !== -1 && arrayEnd !== -1) {
                responseText = responseText.substring(arrayStart, arrayEnd + 1);
            }

            const questions: GeneratedQuestion[] = JSON.parse(responseText);
            if (questions.length > 0) return questions;
        } catch (err) {
            lastError = err as Error;
            console.error(`Model ${model} failed:`, (err as Error).message);
            continue;
        }
    }

    throw lastError || new Error("All models failed to generate quiz");
}
