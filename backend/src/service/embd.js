import OpenAI from "openai" ;

// const openAI = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const createEmbedding = async (text) => {
//   try {
//     const inputArray = Array.isArray(text) ? text : [text];

//     const response = await openAI.embeddings.create({
//       model: "text-embedding-3-small",
//       input: inputArray,
//     });

//     return response.data.map(item => item.embedding);
//   } catch (error) {
//     console.error("Embedding creation failed:", error);
//     throw error;
//   }
// };

export class  EmbeddingService{

     constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
    this.model = "text-embedding-3-small";
}

     async createEmbedding(text) {

          try {
          const inputArray = Array.isArray(text) ? text : [text];

          const response=await this.client.embeddings.create({
               model:this.model,
                 input: inputArray
          })

       

        return response.data.map(item => item.embedding);
        } catch (error) {
    console.error("Embedding creation failed:", error);
    throw error;
  }
     }

}

