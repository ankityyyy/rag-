import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import chatRoutes from "./src/routes/chat.js"
import ExpressError from "./src/utils/expressError.js"
import { StatusCodes } from "http-status-codes";
import cors from "cors";
 
const app=express();

const port=process.env.PORT || 5000

async function Main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/studentDB");
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Error:", err);
  }
}
Main();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173","https://rag-peach-phi.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT","PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/",(req,res)=>{
  console.log("sever work");
})

app.use("/api/v1",chatRoutes);

app.get("/docker",(req,res)=>{
  console.log("docker work");
})

app.use((req,res,next)=>{
  next(new ExpressError("page not found",StatusCodes.NOT_FOUND))
})

app.use((err,req,res,next)=>{
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
})

app.listen(port,()=>{
      console.log(`Server running on port ${port}`)
})

