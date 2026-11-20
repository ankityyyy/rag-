import { QdrantClient } from "@qdrant/js-client-rest";
import crypto from "crypto"; 

export class VectorStore {
     constructor(){
          this.client=new QdrantClient({
                url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
      checkCompatibility: false,
          })

          this.collection='0pkd'
     }

     

     async createCollection(){

          let collections= await this.collection.getCollections()

          let exists=collections.collections.some((c) => c.name === this.collection);

          if(!exists){
               await this.collection.createCollection(this.collection,{
                     vectors: {
            size: 1536,
            distance: "Cosine",
          },
               })
          }




     }

     async addDocuments(chunks, embeddings, documentId) {

          let points=chunks.map((chunk,index)=>({
               id:"iwiw",
               vector:embeddings[index],
               payload:{
                    text:chunk.pageContent,
                    documentId,
               }
          }))

          await this.client.upsert(this.collection, {
      points,
    });

     return points.length;
     }
}
