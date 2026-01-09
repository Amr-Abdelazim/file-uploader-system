import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import FolderValidation from "../middlewares/validations/FolderValidation.js";
import PreviewController from "../controllers/PreviewController.js";
import asyncHandler from "express-async-handler";
const router = Router();

router.get("/preview/folder/:folderId",
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(),
    asyncHandler(PreviewController.folderPreview)
);

export default router;