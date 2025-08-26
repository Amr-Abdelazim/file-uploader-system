import { Router } from "express";
import UploadController from "../controllers/UploadController.js";
import asyncHandler from "express-async-handler";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import UploadValidation from "../middlewares/validations/UploadValidation.js";
import MulterMiddleware from "../middlewares/MulterMiddleware.js";


const router = Router();


router.post('/upload/:folderId',
    AuthMiddleware.verifyToken,
    UploadValidation.fileUpload(),
    MulterMiddleware.uploadFiles('files'),
    asyncHandler(UploadController.upload)
);


export default router;

