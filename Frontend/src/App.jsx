import React, { useState } from "react";
import QuestionInput from "./components/qa/QuestionInput";
import {
  FileText,
  Search,
  Upload,
  Bot,
  Send,
  Sparkles,
} from "lucide-react";

import { PDFProvider, usePDFContext } from "./context/PDFContext";
import { uploadPDF } from "./services/api";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const {
    documentId,
    fileName,
    setDocumentId,
    setFileName,
  } = usePDFContext();

  const handleFileUpload = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = await uploadPDF(file);

      setDocumentId(data.documentId);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
      setError("Failed to upload PDF. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleNewAnswer = ({ question, answer }) => {
    setMessages((prev) => [
      ...prev,
      {
        question,
        answer,
      },
    ]);
  };

  return (
    <div className="app-shell">

      {/* LEFT SIDEBAR */}
      <aside className="document-sidebar">

        <div className="sidebar-header">
          <h2>Document Library</h2>
        </div>

        {/* Search */}
        <div className="search-wrapper">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Upload */}
        <label className="upload-dropzone">

          {uploading ? (
            <div className="upload-loading">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="upload-icon" size={25} />

              <span className="upload-title">
                Drop PDF files here or click to upload
              </span>

              <span className="upload-subtitle">
                Supports multiple files
              </span>
            </>
          )}

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            hidden
          />
        </label>

        {error && (
          <p className="upload-error">
            {error}
          </p>
        )}

        {/* Documents */}
        <div className="documents-section">

          <div className="documents-title">
            Documents
          </div>

          {fileName ? (
            <div className="document-item">
              <FileText size={20} />

              <div className="document-info">
                <span className="document-name">
                  {fileName}
                </span>

                <span className="document-status">
                  Ready
                </span>
              </div>
            </div>
          ) : (
            <div className="empty-documents">

              <FileText size={32} />

              <p>No documents uploaded</p>

              <span>
                Upload PDF files to start chatting with your documents
              </span>

            </div>
          )}

        </div>

      </aside>

      {/* RIGHT CHAT AREA */}
      <main className="chat-area">

        {/* HEADER */}
        <header className="chat-header">

          <div className="assistant-icon">
            <Bot size={20} />
          </div>

          <div>
            <h1>AI Document Assistant</h1>
            <p>Ask questions about your uploaded documents</p>
          </div>

        </header>

        {/* CHAT CONTENT */}
        <div className="chat-content">

          {messages.length === 0 ? (

            <div className="welcome-screen">

              <div className="welcome-icon">
                <Bot size={27} />
              </div>

              <h2>Welcome to AI Document Chat</h2>

              <p>
                Upload PDF documents and start asking questions.
                I'll help you find relevant information using
                advanced semantic search and AI.
              </p>

              <div className="welcome-points">
                <span>• Upload PDFs using the sidebar</span>
                <span>• Ask specific questions about your documents</span>
                <span>• Get answers with source citations</span>
              </div>

            </div>

          ) : (

            <div className="messages-container">

              {messages.map((message, index) => (

                <div className="message-group" key={index}>

                  {/* QUESTION */}
                  <div className="user-message">
                    <div className="message-label">
                      You
                    </div>

                    <div className="user-bubble">
                      {message.question}
                    </div>
                  </div>

                  {/* ANSWER */}
                  <div className="assistant-message">

                    <div className="message-label assistant-label">
                      <Bot size={16} />
                      AI Document Assistant
                    </div>

                    <div className="answer-content">
                      {message.answer}
                    </div>

                    <div className="source-box">
                      <Sparkles size={15} />
                      <span>
                        Answer generated from your uploaded document
                      </span>
                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* INPUT */}
        <div className="chat-input-area">

          <QuestionInput
            onNewAnswer={handleNewAnswer}
          />

          <p className="input-hint">
            Press Enter to send • Shift + Enter for new line
          </p>

        </div>

      </main>

    </div>
  );
};

const App = () => {
  return (
    <PDFProvider>
      <Chat />
    </PDFProvider>
  );
};

export default App;