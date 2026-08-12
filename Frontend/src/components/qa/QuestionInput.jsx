import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { usePDFContext } from "../../context/PDFContext";
import { askQuestion } from "../../services/api";

const QuestionInput = ({ onNewAnswer }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const { documentId } = usePDFContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim() || !documentId || loading) return;

    setLoading(true);

    try {
      const data = await askQuestion(
        documentId,
        question
      );

        console.log("Question:", question);
console.log("Document ID:", documentId);
console.log("Backend response:", data);
      onNewAnswer({
        question,
        answer: data.answer,
      });

      setQuestion("");

    } catch (err) {
      console.error("Failed to get answer:", err);

    } finally {
      setLoading(false);
    }
  };



  return (
    <form
      onSubmit={handleSubmit}
      className="question-form"
    >

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question about your documents..."
        disabled={loading}
      />

      <button
        type="submit"
        disabled={
          loading ||
          !question.trim() ||
          !documentId
        }
        aria-label="Send question"
      >
        {loading ? (
          <Loader2
            size={17}
            className="spin"
          />
        ) : (
          <Send size={17} />
        )}
      </button>

    </form>
  );
};

export default QuestionInput;