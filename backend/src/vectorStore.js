import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";

// =====================================================
// 🔹 1. INIT CLIENT
// =====================================================
export const client = new QdrantClient({
  url: "http://localhost:6333",
});

// =====================================================
// 🔹 2. CREATE COLLECTION
// =====================================================
export async function createCollection() {
  const collections = await client.getCollections();

  const exists = collections.collections.some(
    (c) => c.name === "pdf_docs"
  );

  if (!exists) {
    await client.createCollection("pdf_docs", {
      vectors: {
        size: 1536,        // OpenAI embedding size
        distance: "Cosine"
      },
    });

    console.log("✅ Collection created: pdf_docs");
  } else {
    console.log("📦 Collection already exists");
  }
}

// =====================================================
// 🔹 3. STORE EMBEDDINGS
// =====================================================
export async function storeEmbedding(id, embedding, text, documentId) {
  try {
    const flatEmbedding = Array.isArray(embedding[0])
      ? embedding[0]
      : embedding;

    await client.upsert("pdf_docs", {
      points: [
        {
          id: id || uuidv4(),
          vector: flatEmbedding,
          payload: {
            text,
            documentId,
          },
        },
      ],
    });

    // console.log("✅ Stored chunk:", id);
  } catch (err) {
    console.error("❌ Error storing embedding:", err);
  }
}

// =====================================================
// 🔹 4. SEARCH SIMILAR
// =====================================================
export async function searchSimilar(queryEmbedding, documentId) {
  try {
    const vector = Array.isArray(queryEmbedding[0])
      ? queryEmbedding[0]
      : queryEmbedding;

    const results = await client.search("pdf_docs", {
      vector: vector,
      limit: 5,
      filter: {
        must: [
          {
            key: "documentId",
            match: { value: documentId },
          },
        ],
      },
    });

    if (results.length > 0) {
      console.log("🔎 Top Score:", results[0].score);
      console.log(
        "📄 Sample:",
        results[0].payload.text.slice(0, 100)
      );
    }

    return results;
  } catch (err) {
    console.error("❌ Search error:", err);
    return [];
  }
}

// =====================================================
// 🔹 5. GENERATE ID
// =====================================================
export function generateId() {
  return uuidv4();
}

// =====================================================
// 🔹 6. RRF FUSION (FIXED WITH SCORE)
// =====================================================
export function rrfFusion(results, k = 60) {
  const scores = new Map();

  results.forEach((list) => {
    list.forEach((item, rank) => {
      const text = item.payload.text;

      if (!scores.has(text)) {
        scores.set(text, { item, score: 0 });
      }

      scores.get(text).score += 1 / (k + rank);
    });
  });

  return Array.from(scores.values())
    .sort((a, b) => b.score - a.score)
    .map((obj) => ({
      ...obj.item,
      score: obj.score, // ✅ keep score
    }));
}