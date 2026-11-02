import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';

const VALID_OBJECT_TYPES = ['file', 'folder'];
const VALID_ROLES = ['viewer', 'editor', 'owner'];

function getRoleWeight(role) {
    const weights = {
        viewer: 1,
        editor: 2,
        owner: 3,
    };
    return weights[role] || 0;
}

function validateObjectType(objectType) {
    return VALID_OBJECT_TYPES.includes(objectType);
}

function validateRole(role) {
    return VALID_ROLES.includes(role);
}

async function resolveTargetUserId(targetUserId, targetUserEmail) {
    if (targetUserId) return targetUserId;
    if (!targetUserEmail) return null;

    const user = await prisma.user.findUnique({
        where: { email: targetUserEmail },
        select: { id: true }
    });

    if (!user) {
        throw new CustomError('Target user not found', 404);
    }

    return user.id;
}

async function ensureObjectExists(objectType, objectId) {
    const model = objectType === 'file' ? prisma.file : prisma.folder;
    const select = objectType === 'file'
        ? { id: true, ownerId: true, visibility: true }
        : { id: true, ownerId: true, visibility: true };

    const object = await model.findUnique({
        where: { id: objectId },
        select
    });

    if (!object) {
        throw new CustomError(`${objectType} not found`, 404);
    }

    return object;
}

async function createOrUpdatePermission({ objectType, objectId, targetUserId, targetUserEmail, role }) {
    if (!validateObjectType(objectType)) {
        throw new CustomError('Invalid objectType', 400);
    }

    if (!validateRole(role)) {
        throw new CustomError('Invalid role', 400);
    }

    const userId = await resolveTargetUserId(targetUserId, targetUserEmail);
    if (!userId) {
        throw new CustomError('targetUserId or targetUserEmail required', 400);
    }

    await ensureObjectExists(objectType, objectId);

    const permission = await prisma.permission.upsert({
        where: {
            userId_objectId_objectType: {
                userId,
                objectId,
                objectType
            }
        },
        create: {
            userId,
            objectId,
            objectType,
            role
        },
        update: {
            role
        },
        select: {
            id: true,
            userId: true,
            objectId: true,
            objectType: true,
            role: true,
            createdAt: true
        }
    });

    return permission;
}

async function revokePermission({ objectType, objectId, targetUserId, targetUserEmail }) {
    if (!validateObjectType(objectType)) {
        throw new CustomError('Invalid objectType', 400);
    }

    const userId = await resolveTargetUserId(targetUserId, targetUserEmail);
    if (!userId) {
        throw new CustomError('targetUserId or targetUserEmail required', 400);
    }

    const deleted = await prisma.permission.deleteMany({
        where: {
            userId,
            objectId,
            objectType
        }
    });

    if (deleted.count === 0) {
        throw new CustomError('Permission not found', 404);
    }

    return true;
}

async function listPermissions(objectType, objectId) {
    if (!validateObjectType(objectType)) {
        throw new CustomError('Invalid objectType', 400);
    }

    await ensureObjectExists(objectType, objectId);

    const permissions = await prisma.permission.findMany({
        where: {
            objectType,
            objectId
        },
        select: {
            userId: true,
            role: true,
            createdAt: true
        }
    });

    return permissions;
}

export default {
    createOrUpdatePermission,
    revokePermission,
    listPermissions,
    getRoleWeight,
    VALID_OBJECT_TYPES,
    VALID_ROLES
};
