import { Router } from 'express';
import AuthMiddleware from '../middlewares/AuthMiddleware.js';
import asyncHandler from 'express-async-handler';
import PermissionController from '../controllers/PermissionController.js';
import PermissionValidation from '../middlewares/validations/PermissionValidation.js';

const router = Router();

router.get('/permission/:objectType/:objectId',
    AuthMiddleware.verifyToken,
    PermissionValidation.validatePermissionQuery(),
    asyncHandler(PermissionController.getPermissions)
);

router.post('/permission',
    AuthMiddleware.verifyToken,
    PermissionValidation.validatePermissionAction(),
    asyncHandler(PermissionController.assignPermission)
);

router.delete('/permission',
    AuthMiddleware.verifyToken,
    PermissionValidation.validatePermissionDelete(),
    asyncHandler(PermissionController.revokePermission)
);

export default router;
