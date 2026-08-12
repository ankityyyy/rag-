import {generateHyDE} from "../service/hyde.js"

export async function hydeNode(state) {

  const hydeSpan = state.trace.span({
    name: "hyde",
    input: {
      question: state.query
    }
  });

  const hydeText = await generateHyDE(state.query);

  hydeSpan.end({
    output: hydeText
  });

  return {
    hydeQuery: hydeText
  };
}