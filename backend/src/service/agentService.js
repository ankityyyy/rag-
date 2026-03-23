import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function decideRoute(question) {
  const lowerQ = question.toLowerCase();

  // STRICT DB detection
  if (
    lowerQ.includes("database") ||
    lowerQ.includes("db") ||
    (lowerQ.includes("users") && lowerQ.includes("count"))
  ) {
    return "db";
  }

  // Default → PDF
  return "pdf";
}