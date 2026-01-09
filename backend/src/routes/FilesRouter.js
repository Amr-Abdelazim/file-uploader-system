import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import asyncHandler from "express-async-handler";
import FileValidation from "../middlewares/validations/FileValidation.js";
import FileController from "../controllers/FileController.js";
const router = Router();

router.get('/file/download/:fileId',
    AuthMiddleware.verifyToken,
    FileValidation.validateFile(),
    asyncHandler(FileController.downloadFile)
);

export default router;