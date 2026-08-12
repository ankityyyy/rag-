import { getRelatedFacts } from "../knowledgegraph/graph.js";

export async function neo4jNode(state) {

  const graphSpan = state.trace.span({
    name: "neo4j-retrieval",
    input: {
      entities: state.entities
    }
  });

  const graphResults = await getRelatedFacts(
    state.entities
  );

  graphSpan.end({
    output: graphResults
  });

  return {
    neo4jResults: graphResults
  };
}