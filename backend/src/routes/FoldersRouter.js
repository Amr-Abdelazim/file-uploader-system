import { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import asyncHandler from "express-async-handler";
import FoldersController from "../controllers/FoldersController.js";
import FolderValidation from "../middlewares/validations/FolderValidation.js";
const router = Router();

router.post('/folder',
    AuthMiddleware.verifyToken,
    FolderValidation.validateCreateFolder(),
    asyncHandler(FoldersController.createFolder)
);

router.get('/folder/root',
    AuthMiddleware.verifyToken,
    asyncHandler(FoldersController.getRoot)
);

router.get('/folder/check/:folderId',
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(),
    (req, res, next) => { res.status(200).end(); }
);

router.get('/folder/:folderId',
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(),
    asyncHandler(FoldersController.getFolder)
);

router.put('/folder/:folderId',
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(false),
    asyncHandler(FoldersController.updateFolder)
);

router.delete('/folder/:folderId',
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(false),
    asyncHandler(FoldersController.deleteFolder)
);

router.get('/folder/path/:folderId',
    AuthMiddleware.verifyToken,
    FolderValidation.validateFolder(),
    asyncHandler(FoldersController.getFolderPath)
);

export default router;