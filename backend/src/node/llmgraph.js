import llmCall from "../service/llm.js";

const llmCallNode = async (state) => {

  const generation = state.trace.generation({
    name: "final-answer",
    model: "gpt-4.1-mini",
    input: {
      question: state.query,
      context: state.finalContext
    }
  });

  const finalResult = await llmCall(
    state.query,
    state.finalContext
  );

  generation.end({
    output: finalResult
  });

  return {
    answer: finalResult
  };
};

export { llmCallNode };