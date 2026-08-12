import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



export async function extractTriples(text) {

  try {

    const response = await openai.chat.completions.create({

      model: "gpt-4.1-mini",

      messages: [
        {
          role: "system",
          content: `
You are a knowledge graph extractor.

Return ONLY a JSON array.

Format:
[
  {
    "subject": "string",
    "relation": "string",
    "object": "string"
  }
]

If there are no relationships, return [].
`
        },
        {
          role: "user",
          content: text
        }
      ],

      temperature: 0
    });

    const raw = response.choices[0].message.content;

    console.log("LLM output:", raw);

    return JSON.parse(raw);

  } catch (error) {

    console.error("Triple extraction failed:", error);

    return [];
  }
}