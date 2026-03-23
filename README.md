# pdf-db-rag

PDF RAG Chatbot

A RAG (Retrieval-Augmented Generation) chatbot built with the MERN stack, capable of answering questions based on uploaded PDFs. Uses two databases: MongoDB for storing user queries/metadata and Qdrant (vector database) for semantic search. Powered by OpenAI API for natural language understanding.

Tech Stack
Frontend: React, Tailwind CSS
Backend: Node.js, Express.js
Databases:
MongoDB: Stores user info, queries, and PDF metadata (not actual PDFs)
Qdrant: Stores embeddings of PDF content for semantic search
AI: OpenAI API (text embeddings + completions)
Deployment: Render / Docker
Features
Upload PDFs (content extracted temporarily for embeddings)
Generate embeddings for PDF chunks and store in Qdrant
Ask questions about PDFs in natural language
Chatbot returns contextually relevant answers using RAG
Store user queries and metadata in MongoDB
How It Works
User uploads PDF
Backend extracts text from PDF.
PDF content is not stored in MongoDB.
Metadata (filename, user info) is stored in MongoDB.
Create embeddings
Each PDF chunk is sent to OpenAI embeddings API.
Embeddings are stored in Qdrant vector database for semantic search.
Chatting / Querying
User sends a question.
Backend queries Qdrant to find the most relevant PDF chunks.
The selected chunks are sent to OpenAI GPT API to generate the answer.
Answer is returned to the frontend chat interface.
Database Roles
MongoDB: Users, queries, PDF metadata (no PDF content)
Qdrant: Semantic vectors for PDF content
Project Structure
pdf-rag/
├── backend/
|__ src/             # Node.js + Express backend
│   ├── controllers/      # API logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   ├── services/         # OpenAI + Qdrant integration
│   └── server.js
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   └── pages/        # Pages
│   └── package.json
├── docker-compose.yml    # For local multi-db setup (Mongo + Qdrant)
└── README.md
Installation / Local Setup
Clone the repo
git clone https://github.com/<your-username>/<repo>.git
cd pdf-rag
Set up environment variables
Create a .env file in backend:
PORT=5000
MONGO_URI=<your-mongodb-uri>
QDRANT_URL=http://localhost:6333
OPENAI_API_KEY=<your-openai-key>
Run backend
cd backend
npm install
npm start
Run frontend
cd frontend
npm install
npm start
(Optional) Docker setup for local multi-db
docker-compose up --build
Usage
Go to http://localhost:3000 (frontend)
Sign up / login
Upload PDFs (content is extracted and embedded in Qdrant)
Ask questions in the chat — answers are generated using RAG + OpenAI API
Queries and metadata are logged in MongoDB
Deployment
Backend and frontend can be deployed on Render using Docker or separate services.
Ensure environment variables (MONGO_URI, QDRANT_URL, OPENAI_API_KEY) are set on the platform.