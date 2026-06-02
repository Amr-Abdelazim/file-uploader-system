import prisma from "../utils/prisma.js";



async function hasAccess(userId, objectId, objectType, requiredRole = "viewer") {

    const model = objectType === "file" ? prisma.file : prisma.folder;

    const obj = await model.findUnique({
        where: { id: objectId },
        select: {
            ownerId: true,
            visibility: true
        }
    });

    if (!obj) return false;


    if (obj.ownerId === userId) return true;


    if (obj.visibility === "public" && requiredRole === "viewer") {
        return true;
    }


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

    if (!permission) return false;


    const roleHierarchy = {
        viewer: 1,
        editor: 2,
        owner: 3
    };

    return roleHierarchy[permission.role] >= roleHierarchy[requiredRole];
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