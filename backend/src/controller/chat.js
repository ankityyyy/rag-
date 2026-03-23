import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { StatusCodes } from "http-status-codes";
import ExpressError from "../util/ExpressError.js";
import { splitText } from "../chunkText.js";
import { storeEmbedding,rrfFusion } from "../vectorStore.js";
import { searchSimilar } from "../search.js";
import OpenAI from "openai";
import createEmbeddings from "../embedding.js";
import { v4 as uuidv4 } from "uuid";
import { decideRoute } from "../service/agentService.js";
import { runRAG } from "../service/ragService.js";
import { runDBQuery } from "../service/dbService.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
==========================
UPLOAD PDF CONTROLLER
==========================
*/
export const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ExpressError("No file uploaded", StatusCodes.BAD_REQUEST));
    }

    const filePath = req.file.path;


    const documentId = Date.now().toString();
    

    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      text += pageText + "\n";
    }

    // Clean text
    text = text.replace(/\.{3,}/g, "").replace(/\s+/g, " ").trim();

    // Split into chunks
    const chunks = splitText(text);
    

    // Create embeddings
    const embeddings = await createEmbeddings(chunks);
    

    // Store each chunk
    for (let i = 0; i < embeddings.length; i++) {
      const flatEmbedding = Array.isArray(embeddings[i][0]) ? embeddings[i][0] : embeddings[i];
      await storeEmbedding(uuidv4(), flatEmbedding, chunks[i], documentId);
    }

    res.status(StatusCodes.OK).json({
      message: "PDF processed successfully",
      fileName: req.file.originalname,
      documentId,
      totalChunks: chunks.length,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    next(new ExpressError(err.message, StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

/*
==========================
ASK QUESTION CONTROLLER
==========================
*/
// export const askQuestion = async (req, res, next) => {
//   try {
//     const question = req.query.question;
//     const documentId = req.params.documentId;

//     if (!question) {
//       return next(new ExpressError("Question is required", StatusCodes.BAD_REQUEST));
//     }

//     // =====================================================
//     // 🔹 STEP 1: DB CHECK (STRICT)
//     // =====================================================
//     // if (isDbQuery(question)) {
//     //   console.log("Route: db");

//     //   const dbResult = await runDBQuery(question);

//     //   if (dbResult && dbResult.count !== undefined) {
//     //     return res.json({
//     //       answer: `Total users: ${dbResult.count}`,
//     //       type: "db",
//     //     });
//     //   }

//     //   if (Array.isArray(dbResult) && dbResult.length > 0) {
//     //     return res.json({
//     //       answer: JSON.stringify(dbResult),
//     //       type: "db",
//     //     });
//     //   }

//     //   console.log("DB fallback → no data");
//     // }

//     // =====================================================
//     // 🔹 STEP 2: ALWAYS TRY RAG (NO DECISION ❌)
//     // =====================================================

//     // 🔥 HyDE
//     const hydeResponse = await openai.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         {
//           role: "system",
//           content: "Generate a detailed answer for the question.",
//         },
//         {
//           role: "user",
//           content: question,
//         },
//       ],
//     });

//     const hydeText = hydeResponse.choices[0].message.content;

//     // 🔥 Multi-query
//     const queries = [
//       question,
//       `Explain in detail: ${question}`,
//       `Real-world example of: ${question}`,
//       hydeText,
//     ];

//     // 🔥 Embeddings
//     const embeddingsArray = await Promise.all(
//       queries.map((q) => createEmbeddings(q))
//     );

//     const embeddings = embeddingsArray.map((e) => e[0]);

//     // 🔥 Vector search
//     const results = await Promise.all(
//       embeddings.map((e) => searchSimilar(e, documentId))
//     );

//     // =====================================================
//     // 🔹 RRF FUSION
//     // =====================================================
//     function rrfFusion(results, k = 60) {
//       const scores = new Map();

//       results.forEach((list) => {
//         list.forEach((item, rank) => {
//           const text = item.payload.text;

//           if (!scores.has(text)) {
//             scores.set(text, { item, score: 0 });
//           }

//           scores.get(text).score += 1 / (k + rank);
//         });
//       });

//       return Array.from(scores.values())
//         .sort((a, b) => b.score - a.score)
//         .map((obj) => obj.item);
//     }

//     const fusedDocs = rrfFusion(results);
//     const topDocs = fusedDocs.slice(0, 5);

//     console.log("Final docs:", topDocs.length);

//     // =====================================================
//     // 🔹 STEP 3: CHECK IF PDF HAS DATA
//     // =====================================================
//     if (topDocs.length > 0) {
//       console.log("Route: pdf");

//       const context = topDocs.map((r) => r.payload.text).join("\n");

//       const completion = await openai.chat.completions.create({
//         model: "gpt-4.1-mini",
//         messages: [
//           {
//             role: "system",
//             content:
//               "Answer ONLY using the provided context. If answer is not in context, say 'I don't know'.",
//           },
//           {
//             role: "user",
//             content: `Context:\n${context}\n\nQuestion: ${question}`,
//           },
//         ],
//       });

//       return res.json({
//         answer: completion.choices[0].message.content,
//         type: "pdf",
//       });
//     }

//     console.log("PDF fallback → no data");

//     // =====================================================
//     // 🔹 STEP 4: FINAL FALLBACK (CHAT)
//     // =====================================================
//     console.log("Route: chat");

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [{ role: "user", content: question }],
//     });

//     return res.json({
//       answer: completion.choices[0].message.content,
//       type: "chat",
//     });

//   } catch (err) {
//     console.error("Ask Question Error:", err);
//     next(new ExpressError(err.message, StatusCodes.INTERNAL_SERVER_ERROR));
//   }
// };


export const askQuestion = async (req, res, next) => {
  try {
    const question = req.query.question;
    const documentId = req.params.documentId;

    if (!question) {
      throw new ExpressError("Question is required", 400);
    }

    // 🔹 Decide route
    const route = await decideRoute(question);
    console.log("Route:", route);
    console.log({
  question,
  route,
  documentId
});

    // =========================
    // DB
    // =========================
    if (route === "db") {
  console.log("Route: DB");

  const dbResult = await runDBQuery(question);
  console.log("DB Result:", dbResult);

  // ✅ COUNT
  if (dbResult?.count !== undefined) {
    return res.json({
      answer: `Total users: ${dbResult.count}`,
      type: "db",
    });
  }

  // ✅ FIND
  if (Array.isArray(dbResult) && dbResult.length > 0) {
    return res.json({
      answer: JSON.stringify(dbResult),
      type: "db",
    });
  }

  // ❌ HANDLE EMPTY / ERROR
  return res.json({
    answer: "No data found in database",
    type: "db",
  });
}

    // =========================
    // RAG
    // =========================
    if (route === "pdf") {
      const ragResult = await runRAG(question, documentId);

      if (ragResult.type === "success") {
        return res.json({
          answer: ragResult.data,
          type: "pdf",
        });
      }
    }

    // =========================
    // FALLBACK CHAT
    // =========================
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: question }],
    });

    return res.json({
      answer: completion.choices[0].message.content,
      type: "chat",
    });

  } catch (err) {
    console.error("AskQuestion Error:", err);
    next(err);
  }
};