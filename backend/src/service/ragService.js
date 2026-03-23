import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();  

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); 

 
import createEmbeddings from "../embedding.js";
import { searchSimilar } from "../search.js";
import { rrfFusion } from "../util/rrf.js";

export async function runRAG(question, documentId) {

  // 🔹 HyDE
  const hydeRes = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Generate a detailed answer." },
      { role: "user", content: question },
    ],
  });

  const hydeText = hydeRes.choices[0].message.content;

  // 🔹 Queries
  const queries = [
    question,
    `Explain in detail: ${question}`,
    `Example of: ${question}`,
    hydeText,
  ];

  // 🔹 Embeddings
  const embeddingsArray = await Promise.all(
    queries.map(q => createEmbeddings(q))
  );

  const embeddings = embeddingsArray.map(e => e[0]);

  // 🔹 Search
  const results = await Promise.all(
    embeddings.map(e => searchSimilar(e, documentId))
  );

  // 🔹 RRF
const fusedDocs = rrfFusion(results);
const topDocs = fusedDocs.slice(0, 5);

// 🔹 Fallback
if (!topDocs.length || topDocs[0].score < 0.01) {
  return { type: "fallback", data: null };
}

// 🔹 Safe context
const context = topDocs
  .filter(r => r?.payload?.text)
  .map(r => r.payload.text)
  .join("\n");


  // const context = topDocs.map(r => r.payload.text).join("\n");

  // 🔹 Final Answer
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
Answer using only context.
If not found, say "I don't know".
        `,
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  return {
    type: "success",
    data: completion.choices[0].message.content,
  };
}