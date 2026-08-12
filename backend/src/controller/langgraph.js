import { app as ragGraph } from "../graph/ragGraph.js";
import { StatusCodes } from "http-status-codes";
import ExpressError from "../utils/expressError.js";
import {langfuse} from "../utils/langfuse.js"


export const query=async(req,res,next)=>{

      const { text } = req.body;
    const { documentId } = req.params;
    if(!documentId){
       return next(
           new ExpressError(
             "document id is required",
             StatusCodes.BAD_REQUEST
           )
          )

    }

    const trace = langfuse.trace({
      name: "rag-query",
      input: {
        question: text
      }
    }); 

    const result = await ragGraph.invoke({
        query: text,
        documentId,
         trace
      },
     {
    configurable: {
      thread_id: documentId
    }
  });

  await langfuse.flushAsync();

  return res.status(StatusCodes.OK).json({
  question:text,
  answer:result.answer,
})

 }