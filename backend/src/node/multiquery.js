import {generateQueries} from "../service/queryGenerator.js" 

export async function multiQueryNode(state) {

  const querySpan = state.trace.span({
    name: "multi-query",
    input: {
      hyde: state.hydeQuery
    }
  });

  const queries = await generateQueries(state.hydeQuery);

  querySpan.end({
    output: queries
  });

  return {
    queries
  };
}