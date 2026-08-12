import fs from "fs/promises";
import path from "path";
import os from "os";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { StatusCodes } from "http-status-codes";
import ExpressError from "../utils/expressError.js";
import {getText} from "../service/chunk.js"
import { EmbeddingService} from "../service/embd.js"
import {VectorStore} from "../service/vectorStore.js"
import crypto from "crypto";
import llmCall from "../service/llm.js"
import {generateQueries} from "../service/queryGenerator.js" 
import  rrf from "../service/rrf.js"
import {generateHyDE} from "../service/hyde.js"
 import {extractTriples} from "../knowledgegraph/graphExtractor.js"
 import {addFact,getRelatedFacts,extractEntities} from "../knowledgegraph/graph.js"
import {langfuse} from "../utils/langfuse.js"



const uploadpdf=async(req,res,next)=>{

     if (!req.file) {
         return next(
           new ExpressError(
             "Resume file is required",
             StatusCodes.BAD_REQUEST
           )
         );
       }

let tempPath;
let docs;

try {
  // Get the operating system's temporary directory.
  // Examples:
  // Windows -> C:\Users\<User>\AppData\Local\Temp
  // Linux   -> /tmp
  tempPath = path.join(
    os.tmpdir(),
    `${Date.now()}-${req.file.originalname}`
  );

  // Write the uploaded PDF buffer to the temporary file.
  await fs.writeFile(tempPath, req.file.buffer);

  // PDFLoader expects a file path, so pass the temp file path.
  const loader = new PDFLoader(tempPath);

  // Read the PDF and convert it into LangChain Documents.
  docs = await loader.load();

  

} finally {
  // This block always runs, even if an error occurs above.
  if (tempPath) {
    try {
      // Delete the temporary file.
      await fs.unlink(tempPath);
    } catch (err) {
      console.error("Failed to delete temp file:", err.message);
    }
  }
}

 

if (!docs || docs.length === 0) {
  return next(
    new ExpressError("Failed to load PDF documents", StatusCodes.BAD_REQUEST)
  );
}

const splitDocs = await getText(docs);

if (!splitDocs || splitDocs.length === 0) {
  return next(
    new ExpressError("Failed to create chunks", StatusCodes.BAD_REQUEST)
  );
}

const kgDocs = splitDocs
  .filter(doc => doc.pageContent.length > 200)
  .slice(0, 40);

const batchSize = 5;

for (let i = 0; i < kgDocs.length; i += batchSize) {

 

  const batch = kgDocs
    .slice(i, i + batchSize)
    .map(doc => doc.pageContent)
    .join("\n");

  const triples = await extractTriples(batch);


  for (const triple of triples) {

    await addFact(
      triple.subject,
      triple.relation,
      triple.object
    );
  }
}




const texts = splitDocs.map(doc => doc.pageContent);



 const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);

 const embeddings = await embeddingService.createEmbedding(texts);

 if (!embeddings ||embeddings.length === 0) {
  return next(
    new ExpressError("Failed to create embeddings", StatusCodes.BAD_REQUEST)
  );
}

  const documentId = crypto.randomUUID();
  
      const vectorStore = new VectorStore();
  
   
  
  
  await vectorStore.addDocuments(splitDocs, embeddings, documentId);
  
  
  
  return res.json({
    message: "PDF processed",
    documentId,
    chunks: splitDocs.length,
    embeddings: embeddings.length
  });
  
}

const query=async(req,res,next)=>{ 
  const { text } = req.body;
    const { documentId } = req.params;

    const trace = langfuse.trace({
  name: "rag-query",
  input: {
    question: text
  }
});

    if(!documentId){
       return next(
           new ExpressError(
             "document id is required",
             StatusCodes.BAD_REQUEST
           )
          )

    }

   

     

    const hydeSpan = trace.span({
  name: "hyde",
  input: {
    question: text
  }
});

const hydeText = await generateHyDE(text);

hydeSpan.end({
  output: hydeText
});





  const querySpan = trace.span({
  name: "multi-query",
  input: {
    hyde: hydeText
  }
});

const queries = await generateQueries(hydeText);

querySpan.end({
  output: queries
});

   
    

    const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);

 const embeddings = await embeddingService.createEmbedding(queries);

 if (!embeddings ||embeddings.length === 0) {
  return next(
    new ExpressError("Failed to create embeddings", StatusCodes.BAD_REQUEST)
  );
}

 const vectorStore = new VectorStore();

const retrievalSpan = trace.span({
  name: "qdrant-retrieval",
  input: {
    queries
  }
});

const results = await Promise.all(
  embeddings.map(embedding =>
    vectorStore.searchSimilar(
      embedding,
      documentId
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


 if (!results ||results.length === 0) {
  return next(
    new ExpressError("Failed to featch  result from vd", StatusCodes.BAD_REQUEST)
  );
}
//////////////////for singele query when it go to llm///
// results = results.points.map(point => {
//     return point.payload.text;
// });


const rrfSpan = trace.span({
  name: "rrf",
  input: {
    resultCount: results.length
  }
});

const finalResults = rrf(results);

rrfSpan.end({
  output: {
    resultCount: finalResults.length
  }
});

 const topResults = finalResults.slice(0, 5);

// Vector context
const context = topResults.map(
  point => point.payload.text
);
const combinedText = context.join("\n");
const entities = await extractEntities(combinedText); 

console.log("Entities:", entities);



// ==========================
// Knowledge Graph
// ==========================

const graphSpan = trace.span({
  name: "neo4j-retrieval",
  input: {
    entities
  }
});

const graphResults =
  await getRelatedFacts(entities);

graphSpan.end({
  output: graphResults
});

console.log("Graph Results:", graphResults);


// Convert graph results to text
const graphContext = graphResults.map(
  item =>
    `${item.entity} ${item.relation} ${item.related}`
);


// ==========================
// Combine both
// ==========================

const finalContext = [
  ...context,
  ...graphContext
];


// ==========================
// LLM
// ==========================

const generation = trace.generation({
  name: "final-answer",
  model: "gpt-4.1-mini",
  input: {
    question: text,
    context: finalContext
  }
});

const finalResult = await llmCall(
  text,
  finalContext
);

generation.end({
  output: finalResult
});



await langfuse.flushAsync();

return res.status(StatusCodes.OK).json({
  question:text,
  answer:finalResult,
})



}

export {uploadpdf,query};