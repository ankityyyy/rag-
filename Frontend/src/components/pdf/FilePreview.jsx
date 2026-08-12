import React from "react";
import { FileText } from "lucide-react";
import { usePDFContext } from "../../context/PDFContext";

const FilePreview = () => {
  const { fileName } = usePDFContext();

  if (!fileName) return null;

  return (
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
  );
};

export default FilePreview;