import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateHyDE(question) {
     
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are helping a retrieval system.

Given the user's question, write a short hypothetical answer.
Do not say "I don't know".
Write only the answer.

Question:
${question}
`,
  });

  return response.output_text;
}