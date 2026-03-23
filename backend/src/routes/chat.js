import express from 'express';
let router= express.Router();
import wrapAsync from "../util/wrapAsync.js";
import {upload,askQuestion} from "../controller/chat.js";
import multer from "multer";
// import {storage} from "../config/cloudinary.js";
import {uploadFile}  from "../config/cloudinary.js";

 
// router.post("/chat")
// router.post("/upload-pdf", uploadFile.single("file"), wrapAsync(upload));
router.post("/upload-pdf", uploadFile.single("file"), wrapAsync(upload));
router.get("/askq/:documentId", wrapAsync(askQuestion));

export default router