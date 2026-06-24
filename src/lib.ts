import { HfInference } from "@huggingface/inference";
import logger from "./logger";

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

function isNonEmptyString(v: unknown): v is string {
    return typeof v === "string" && v.trim().length > 0;
}

function validateGeneratedQuestion(obj: unknown): obj is GeneratedQuestion {
    if (typeof obj !== "object" || obj === null) return false;
    const o = obj as Record<string, unknown>;
    if (!isNonEmptyString(o.questionText)) return false;
    if (!isNonEmptyString(o.optionA)) return false;
    if (!isNonEmptyString(o.optionB)) return false;
    if (!isNonEmptyString(o.optionC)) return false;
    if (!isNonEmptyString(o.optionD)) return false;
    if (!isNonEmptyString(o.explanation)) return false;
    if (!["A", "B", "C", "D"].includes(o.correctAnswer as string)) return false;
    if (o.difficulty && !["easy", "medium", "hard"].includes(o.difficulty as string)) return false;
    return true;
}

export function validateQuestionsArray(arr: unknown): GeneratedQuestion[] {
    if (!Array.isArray(arr)) throw new Error("AI output is not an array");
    const clean: GeneratedQuestion[] = [];
    for (const item of arr) {
        if (!validateGeneratedQuestion(item)) {
            throw new Error("AI returned invalid question format");
        }
        clean.push({
            questionText: item.questionText.trim(),
            optionA: item.optionA.trim(),
            optionB: item.optionB.trim(),
            optionC: item.optionC.trim(),
            optionD: item.optionD.trim(),
            correctAnswer: item.correctAnswer,
            explanation: item.explanation.trim(),
            difficulty: item.difficulty || undefined,
        });
    }
    return clean;
}

const DIFF_PROMPTS: Record<string, string> = {
    easy: `EASY difficulty rules:
- Questions test ONLY direct facts explicitly stated in the text
- Wrong options should be obviously wrong or unrelated
- Use simple, short sentences
- Example: "What is the capital of France?" with options like Paris, London, Tokyo, Sydney`,
    medium: `MEDIUM difficulty rules:
- Questions test understanding and relationships between concepts
- Wrong options should be plausible but clearly distinguishable
- Require the student to connect two ideas together
- Example: "Why does photosynthesis slow down at night?" requiring comprehension`,
    hard: `HARD difficulty rules:
- Questions test deep analysis, synthesis, and application of knowledge
- ALL wrong options must be very plausible and tricky
- Require critical thinking, comparison, or applying concepts to new scenarios
- Example: "If X were removed from the process, which downstream effect would occur first?"`,
};

const ABSTRACT_WORDS: Record<string, number> = { easy: 150, medium: 300, hard: 500 };

export async function generateQuizQuestions(
    text: string,
    difficulty: "easy" | "medium" | "hard",
    numQuestions: number,
    mode: "standard" | "study" | "adaptive" = "standard"
): Promise<GeneratedQuestion[]> {
    let diffInstructions = DIFF_PROMPTS[difficulty];

    if (mode === "adaptive") {
        const per = Math.ceil(numQuestions / 3);
        diffInstructions = `Generate a MIX of difficulties:
- ~${per} EASY questions (direct fact recall, obvious wrong answers)
- ~${per} MEDIUM questions (comprehension, connecting ideas)
- ~${per} HARD questions (analysis, tricky plausible distractors)
Tag each question with its actual difficulty level.`;
    }

    const studyNote = mode === "study"
        ? "\nProvide VERY detailed explanations (2-3 sentences each) that teach the concept."
        : "";

    const prompt = `You are an expert quiz maker. Generate EXACTLY ${numQuestions} multiple-choice questions from the text below.

${diffInstructions}
${studyNote}

TEXT:
"""
${text.substring(0, 6000)}
"""

Return ONLY a valid JSON array. No markdown. No extra text.
[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"...","difficulty":"${difficulty}"}]

CRITICAL RULES:
- correctAnswer must be exactly "A", "B", "C", or "D"
- difficulty must be "${mode === "adaptive" ? "easy\", \"medium\", or \"hard" : difficulty}" for EVERY question
- The correct answer MUST be placed randomly among A/B/C/D (NOT always A)
- Return ONLY the JSON array, nothing else`;

    return await callAI(prompt);
}

// Ensure callAI validates results before returning
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
                    { role: "system", content: "You are an expert quiz generator. Output ONLY valid JSON arrays. No markdown. No extra text." },
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

            const parsed = JSON.parse(text);
            const questions = validateQuestionsArray(parsed);
            if (questions.length > 0) return questions;
        } catch (err) {
            lastError = err as Error;
            logger.error(`Model ${model} failed:`, (err as Error).message);
        }
    }

    throw lastError || new Error("All models failed to generate quiz");
}

export async function generateTopicQuiz(
    topic: string,
    difficulty: "easy" | "medium" | "hard",
    numQuestions: number,
    mode: "standard" | "study" | "adaptive" = "standard"
): Promise<{ questions: GeneratedQuestion[]; generatedText: string }> {
    const wordCount = ABSTRACT_WORDS[difficulty];

    let diffInstructions = DIFF_PROMPTS[difficulty];
    if (mode === "adaptive") {
        const per = Math.ceil(numQuestions / 3);
        diffInstructions = `Generate a MIX: ~${per} easy, ~${per} medium, ~${per} hard. Tag each with its difficulty.`;
    }

    const studyNote = mode === "study"
        ? "\nProvide VERY detailed explanations (2-3 sentences each) that teach the concept."
        : "";

    const prompt = `You are an expert teacher. The student wants to learn about: "${topic}".

Step 1: Write a ${wordCount}-word educational summary about "${topic}".
Step 2: Generate EXACTLY ${numQuestions} MCQs based on your summary.

${diffInstructions}
${studyNote}

Return ONLY valid JSON (no markdown):
{"summary":"your ${wordCount}-word summary...","questions":[{"questionText":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correctAnswer":"A","explanation":"...","difficulty":"${difficulty}"}]}

CRITICAL RULES:
- correctAnswer must be exactly "A", "B", "C", or "D"
- The correct answer MUST be placed randomly among A/B/C/D (NOT always A)
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
                    { role: "system", content: "You are an expert teacher. Output ONLY valid JSON. No markdown. No extra text." },
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
            logger.error(`Model ${model} failed:`, (err as Error).message);
        }
    }

    throw lastError || new Error("All models failed");
}

