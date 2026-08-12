import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client=new OpenAI({
     apikey:process.env.OPENAI_API_KEY
})

const system_prompt = `
You are a PDF Question Answering Assistant.

You will receive:
1. A user's question.
2. Context retrieved from the uploaded PDF.

Rules:
- Answer ONLY using the provided Document Context.
- Do NOT use your own knowledge, assumptions, or external information.
- If the context does not contain enough information to answer the question, reply exactly:
  "I couldn't find this information in the uploaded PDF."
- Do not invent or guess missing details.
- If multiple context chunks contain relevant information, combine them into a single coherent answer.
- Keep the answer clear, accurate, and concise (3-6 sentences).
- Do not mention embeddings, vector databases, retrieval, or the retrieval process.
- Do not include information that is not supported by the context.
`;


const llmCall=async(question,context)=>{

     let result=await client.chat.completions.create({
          model: "gpt-4.1-mini",
          messages:[
               {
                    role:"system",
                    content:system_prompt
               },
                {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
          ],

          max_tokens: 300

     })

     return result.choices[0].message.content;
};

export default llmCall;

