import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Works for single string or array of strings
export default async function createEmbeddings(texts) {
  const inputArray = Array.isArray(texts) ? texts : [texts];

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: inputArray,
  });

  // Returns array of embeddings
  return response.data.map(item => item.embedding);
}
