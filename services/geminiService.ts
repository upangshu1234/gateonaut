import { GoogleGenerativeAI } from "@google/generative-ai";
import { Subject } from "../types";

/* ======================================================
   ENV (Vite-safe)
   ====================================================== */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/* ======================================================
   Gemini Client (SAFE)
   ====================================================== */
let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;

  if (!API_KEY) {
    console.warn("⚠️ VITE_GEMINI_API_KEY missing. Gemini disabled.");
    return null;
  }

  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    return genAI;
  } catch (err) {
    console.error("❌ Gemini init failed:", err);
    return null;
  }
}

/* ======================================================
   Core Generator (WORKING)
   ====================================================== */
async function generateResponse(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const client = getClient();
  if (!client) return "⚠️ AI unavailable.";

  try {
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text || "No response generated.";
  } catch (err) {
    console.error("❌ Gemini request error:", err);
    return "⚠️ AI request failed.";
  }
}

/* ======================================================
   Exported Services
   ====================================================== */

export async function askStudyAssistant(
  query: string,
  context?: string
): Promise<string> {
  const prompt = context
    ? `Context:\n${context}\n\nQuestion:\n${query}`
    : query;

  return generateResponse(
    prompt,
    "You are an IIT Bombay professor. Explain clearly and rigorously."
  );
}

export async function generateNoteContent(
  title: string,
  stream: string
): Promise<string> {
  const prompt = `
Write concise GATE ${stream} short notes for "${title}".
Include formulas, key concepts, and common traps.
Markdown. Max 200 words.
`;
  return generateResponse(prompt);
}

export async function getSyllabusStrategy(
  syllabus: Subject[],
  stream: string,
  daysLeft: number,
  targetMarks: number
): Promise<string> {
  const weak: string[] = [];
  const pending: string[] = [];
  const unstarted: string[] = [];

  syllabus?.forEach((s) =>
    s.chapters?.forEach((c) =>
      c.topics?.forEach((t) => {
        if (t.progress?.pyqFailed) weak.push(`${s.name}: ${t.name}`);
        else if (t.progress?.lecture && !t.progress?.pyq)
          pending.push(`${s.name}: ${t.name}`);
        else if (t.type === "primary" && !t.progress?.lecture)
          unstarted.push(`${s.name}: ${t.name}`);
      })
    )
  );

  const prompt = `
GATE ${stream} Strategy
Days left: ${daysLeft}
Target marks: ${targetMarks}

Weak topics: ${weak.slice(0, 15).join(", ") || "None"}
Pending PYQs: ${pending.slice(0, 15).join(", ") || "None"}
Unstarted primary: ${unstarted.slice(0, 15).join(", ") || "None"}

Give a 7-day plan and honest IIT Bombay feasibility.
Max 350 words.
`;

  return generateResponse(
    prompt,
    "You are an elite IIT Bombay mentor. Be precise and honest."
  );
}

export async function generateSyllabusForStream(): Promise<any[]> {
  return [];
}
