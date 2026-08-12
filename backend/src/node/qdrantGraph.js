import { EmbeddingService} from "../service/embd.js"
import {VectorStore} from "../service/vectorStore.js"


export async function qdrantNode(state) {

  const retrievalSpan = state.trace.span({
    name: "qdrant-retrieval",
    input: {
      queries: state.queries
    }
  });

  const embeddingService = new EmbeddingService(
    process.env.OPENAI_API_KEY
  );

  const embeddings =
    await embeddingService.createEmbedding(state.queries);

  const vectorStore = new VectorStore();

  const results = await Promise.all(
    embeddings.map(embedding =>
      vectorStore.searchSimilar(
        embedding,
        state.documentId
      )
    )
  );

  const resultCount = results.reduce(
    (total, result) => total + result.length,
    0
  );

  retrievalSpan.end({
    output: {
      resultCount
    }
  });

  return {
    qdrantResults: results
  };
}