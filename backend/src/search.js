import { client } from "./vectorStore.js";


export async function searchSimilar(queryEmbedding,documentId) {

  const result = await client.search("pdf_docs", {
  vector: queryEmbedding,
  limit: 5,
  filter: {
    must: [
      {
        key: "documentId",
        match: { value: documentId }
      }
    ]
  }
});

  return result;

}