export async function contextNode(state) {

  const graphContext = state.neo4jResults.map(
    item =>
      `${item.entity} ${item.relation} ${item.related}`
  );

  const finalContext = [
    ...state.context,
    ...graphContext
  ];

  return {
    finalContext
  };
}