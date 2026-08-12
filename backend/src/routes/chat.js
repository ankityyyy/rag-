import express from 'express';
const router =express.Router();
import wrapAsync from "../utils/wrapAsync.js"
import { uploadFile } from "../middleware/uploadFile.js";
import {uploadpdf} from "../controller/ragcontroller.js"
import {query} from "../controller/langgraph.js"

router.post("/upload-pdf",uploadFile.single("file"),wrapAsync(uploadpdf))
router.post("/query/:documentId",wrapAsync(query))

export default router