import React, { createContext, useContext, useState } from "react";

const PDFContext = createContext(null);

export const PDFProvider = ({ children }) => {
  const [documentId, setDocumentId] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <PDFContext.Provider
      value={{
        documentId,
        setDocumentId,
        fileName,
        setFileName,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
};

export const usePDFContext = () => {
  const context = useContext(PDFContext);

  if (!context) {
    throw new Error("usePDFContext must be used inside PDFProvider");
  }

  return context;
};