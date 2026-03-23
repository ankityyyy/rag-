import express from 'express';
import dotenv from "dotenv";
dotenv.config();
import { StatusCodes } from "http-status-codes";
import ExpressError from "./src/util/ExpressError.js";
import chatRoute from "./src/routes/chat.js"
import { createCollection } from "./src/vectorStore.js";
import cors from 'cors';
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

createCollection();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin:"http://localhost:3000",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.get("/t",(req,res)=>{
  console.log("it work")
     res.send("it work ");

})
 
app.use("/chat/v1/api", chatRoute);


app.use((req,res, next)=>{
  next(new ExpressError("page not found",StatusCodes.BAD_REQUEST))
})

app.use((err, req, res, next) => {
    console.log("ERROR:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";
    res.status(statusCode).json({ message });
  });



  






const startServer = async () => {
  try {
    // ✅ 1. Mongoose connection (REQUIRED)
    
    await mongoose.connect(process.env.ATLASDB_URL, {
  dbName: "test",   // ✅ FORCE SAME DB
});
console.log("✅ Mongoose Connected");


    // ✅ 3. Start server
    app.listen( PORT, () => {
      console.log("🚀 Server running on port 5000");
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();






