import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { StatusCodes } from "http-status-codes";

import chatRoutes from "./src/routes/chat.js";
import ExpressError from "./src/utils/expressError.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://rag-peach-phi.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("RAG Backend is running");
});

app.get("/docker", (req, res) => {
  res.send("Docker route is working");
});

app.use("/api/v1", chatRoutes);

// 404
app.use((req, res, next) => {
  next(
    new ExpressError(
      "Page not found",
      StatusCodes.NOT_FOUND
    )
  );
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
});

// MongoDB
async function Main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Error:", err);
  }
}

Main();

// Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});