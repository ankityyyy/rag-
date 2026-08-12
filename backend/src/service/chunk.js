import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const  getText=async(docs)=>{

const splitter= new RecursiveCharacterTextSplitter({
     chunksize:1000,
     chunkOverlap: 150,       
    separators: [
      "\n\n",   
      "\n",     
      ". ",     
      " ",      
    ],
})


const splitDocs=await splitter.splitDocuments(docs)

return splitDocs;
}