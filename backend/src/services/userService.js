import prisma from "../utils/prisma.js";



const roleHierarchy = {
    viewer: 1,
    editor: 2,
    owner: 3
};

function getRoleWeight(role) {
    return roleHierarchy[role] || 0;
}

async function getPermissionRole(userId, objectId, objectType) {
    const permission = await prisma.permission.findUnique({
        where: {
            userId_objectId_objectType: {
                userId,
                objectId,
                objectType
            }
        },
        select: {
            role: true
        }
    });

    return permission?.role || null;
}

async function checkFolderChainAccess(userId, folderId, requiredRole) {
    let currentFolderId = folderId;

    while (currentFolderId) {
        const folder = await prisma.folder.findUnique({
            where: { id: currentFolderId },
            select: {
                ownerId: true,
                visibility: true,
                parentId: true
            }
        });

        if (!folder) break;

        if (folder.ownerId === userId) return true;

        if (folder.visibility === "public" && requiredRole === "viewer") {
            return true;
        }

        const folderPermission = await getPermissionRole(userId, currentFolderId, "folder");
        if (folderPermission && getRoleWeight(folderPermission) >= getRoleWeight(requiredRole)) {
            return true;
        }

        currentFolderId = folder.parentId;
    }

    return false;
}

async function hasAccess(userId, objectId, objectType, requiredRole = "viewer") {
    const model = objectType === "file" ? prisma.file : prisma.folder;
    const select = objectType === "file"
        ? { ownerId: true, visibility: true, folderId: true }
        : { ownerId: true, visibility: true, parentId: true };

    const obj = await model.findUnique({
        where: { id: objectId },
        select
    });

    if (!obj) return false;

    if (obj.ownerId === userId) return true;

    if (obj.visibility === "public" && requiredRole === "viewer") {
        return true;
    }

    const objectPermission = await getPermissionRole(userId, objectId, objectType);
    if (objectPermission && getRoleWeight(objectPermission) >= getRoleWeight(requiredRole)) {
        return true;
    }

    if (objectType === "file") {
        return checkFolderChainAccess(userId, obj.folderId, requiredRole);
    }

    return checkFolderChainAccess(userId, objectId, requiredRole);
}


async function isMyFolder(userId, folderId) {
    return hasAccess(userId, folderId, "folder", "viewer");
}

async function isMyFile(userId, fileId) {
    return hasAccess(userId, fileId, "file", "viewer");
}



async function canEditFile(userId, fileId) {
    return hasAccess(userId, fileId, "file", "editor");
}

async function canEditFolder(userId, folderId) {
    return hasAccess(userId, folderId, "folder", "editor");
}



export default {
    isMyFolder,
    isMyFile,
    canEditFile,
    canEditFolder,
    hasAccess
};