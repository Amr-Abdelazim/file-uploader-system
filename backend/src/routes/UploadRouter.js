import { Router } from "express";
import UploadController from "../controllers/UploadController.js";
import asyncHandler from "express-async-handler";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import UploadValidation from "../middlewares/validations/UploadValidation.js";
import PermissionMiddleware from "../middlewares/PermissionMiddleware.js";
import UploadMiddleware from "../middlewares/UploadMiddleware.js";
const router = Router();

// dont forget to add /upload/session/pending

router.post('/upload/session',
    AuthMiddleware.verifyToken,
    UploadValidation.validateStartSession(),
    PermissionMiddleware.folderEdit,
    asyncHandler(UploadController.startSession)
);

router.post('/upload/chunk',
    AuthMiddleware.verifyToken,
    UploadMiddleware.multipartParser,
    UploadValidation.validateChunk(),
    PermissionMiddleware.sessionAccess,
    asyncHandler(UploadController.uploadChunk)


);

router.post('/upload/finalize',
    AuthMiddleware.verifyToken,
    UploadValidation.validateFinalize(),
    PermissionMiddleware.sessionAccess,
    asyncHandler(UploadController.finalizeUpload)
);

router.get('/upload/session/:sessionId/status',
    AuthMiddleware.verifyToken,
    PermissionMiddleware.sessionAccess,
    asyncHandler(UploadController.sessionUploadStatus)

);



export default router;

