import { extractEntities} from "../knowledgegraph/graph.js"

export async function entityNode(state) {

  const topResults = state.rrfResults.slice(0, 5);

  const context = topResults.map(
    point => point.payload.text
  );

  const combinedText = context.join("\n");

  const entities = await extractEntities(combinedText);

  return {
    context,
    entities
  };
}