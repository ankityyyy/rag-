import { QdrantClient } from "@qdrant/js-client-rest";
import crypto from "crypto";

export class VectorStore {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      checkCompatibility: false,
    });

    this.collection = "pdf1_docs";
  }

  async createCollection(){

     const collections=await this.client.getCollections()

     let exists=collections.collections.some((c) => c.name === this.collection);

     if (!exists) {
        await this.client.createCollection(this.collection, {
           vectors: {
            size: 1536,
            distance: "Cosine",
          },
        });

        console.log(`✅ Collection created: ${this.collection}`);
  }
}

async addDocuments(chunks, embeddings, documentId) {

     let points=chunks.map((chunk,index)=>({
            id:crypto.randomUUID(),

               vector: embeddings[index],

               payload:{
                    text:chunk.pageContent,
                    documentId,
               }

     }))

     await this.client.upsert(this.collection, {
      points,
    });

    console.log(`✅ Uploaded ${points.length} vectors`);

    return points.length;

}

async searchSimilar(queryEmbedding, documentId) {
  const result = await this.client.query(this.collection, {
    query: queryEmbedding,
    limit:3,
    filter: {
      must: [
        {
          key: "documentId",
          match: {
            value: documentId,
          },
        },
      ],
    },
    with_payload: true,
  });

  return result.points;
}

}