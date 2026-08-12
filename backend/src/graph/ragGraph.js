import {
  StateGraph,
  START,
  END,
  MemorySaver
} from "@langchain/langgraph";

import {hydeNode} from "../node/hydegraph.js"
import {multiQueryNode} from "../node/multiquery.js"
import { qdrantNode } from "../node/qdrantGraph.js";
import { rrfNode } from "../node/rrfGraph.js";
import {entityNode} from "../node/entitygraph.js"
import { neo4jNode } from "../node/neo4jGraph.js";
import { contextNode } from "../node/contextGraph.js";
import {llmCallNode} from "../node/llmgraph.js"





const graphState = {
  query: "",
  documentId: "",

  hydeQuery: "",
  queries: [],

  qdrantResults: [],
  rrfResults: [],

  context: [],
  entities: [],

  neo4jResults: [],
  finalContext: [],

  answer: "",
   trace: null
};

const graph=new  StateGraph({
  channels: graphState
});

const checkpointer = new MemorySaver();

graph.addNode("hydeNode", hydeNode);
graph.addNode("multiQueryNode",multiQueryNode);
graph.addNode("qdrantNode", qdrantNode);
graph.addNode("rrfNode",rrfNode);
graph.addNode("entityNode", entityNode);
graph.addNode("neo4jNode",neo4jNode)
graph.addNode("contextNode", contextNode);
graph.addNode("llmCallNode",llmCallNode)

graph.addEdge(START, "hydeNode");
graph.addEdge("hydeNode", "multiQueryNode");
graph.addEdge("multiQueryNode","qdrantNode" );
graph.addEdge("qdrantNode","rrfNode")
graph.addEdge("rrfNode","entityNode")
graph.addEdge("entityNode","neo4jNode")
graph.addEdge("neo4jNode", "contextNode");
graph.addEdge("contextNode","llmCallNode");
graph.addEdge("llmCallNode",END)



export  const app = graph.compile({checkpointer});

