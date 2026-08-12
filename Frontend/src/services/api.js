// Using relative URLs when using Vite proxy
//  const API_BASE = "http://localhost:5000/api/v1";
 const API_BASE ="https://rag-2ndp.onrender.com/api/v1";


//This  is the main entry point of your application when pdf is uploaded.

export const uploadPDF = async (file) => {
  const formData = new FormData();
  formData.append('file', file);   //Creating form data with the file as a key value pair to be  sent to the server.

  //handelling upload-pdf route of backend.
  const response = await fetch(`${API_BASE}/upload-pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};
//http://localhost:3000/chat/v1/api/askq
export const askQuestion = async (documentId, question) => {
  console.log("Sending question for doc:", documentId);
  const response = await fetch(`${API_BASE}/query/${documentId}`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: question,
  }),
});

  // if (!response.ok) {
  //   throw new Error('Failed to get answer');
  // }


  if (!response.ok) {
  const text = await response.text();
  console.error("Backend Error:", text);
  throw new Error(text);
}

  return response.json();
};