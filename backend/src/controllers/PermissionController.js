import permissionService from '../services/permissionService.js';
import userService from '../services/userService.js';
import CustomError from '../utils/CustomError.js';

async function assertOwnerAccess(userId, objectType, objectId) {
    const ok = await userService.hasAccess(userId, objectId, objectType, 'owner');
    if (!ok) {
        throw new CustomError('Permission denied', 403);
    }
}

async function assignPermission(req, res, next) {
    const objectType = req.body.objectType;
    const objectId = req.body.objectId;
    const targetUserId = req.body.targetUserId;
    const targetUserEmail = req.body.targetUserEmail;
    const role = req.body.role;

    await assertOwnerAccess(req.user.userId, objectType, objectId);
    const permission = await permissionService.createOrUpdatePermission({ objectType, objectId, targetUserId, targetUserEmail, role });
    res.json({ success: true, permission });
}

async function revokePermission(req, res, next) {
    const objectType = req.body.objectType;
    const objectId = req.body.objectId;
    const targetUserId = req.body.targetUserId;
    const targetUserEmail = req.body.targetUserEmail;

    await assertOwnerAccess(req.user.userId, objectType, objectId);
    await permissionService.revokePermission({ objectType, objectId, targetUserId, targetUserEmail });
    res.json({ success: true });
}

async function getPermissions(req, res, next) {
    const objectType = req.params.objectType;
    const objectId = req.params.objectId;

    await assertOwnerAccess(req.user.userId, objectType, objectId);
    const permissions = await permissionService.listPermissions(objectType, objectId);
    res.json({ success: true, permissions });
}

export default {
    assignPermission,
    revokePermission,
    getPermissions
};
