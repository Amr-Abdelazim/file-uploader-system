import prisma from "../utils/prisma.js";

async function isMyFolder(userId, folderId) {
    const res = await prisma.folder.findUnique({
        where: {
            id: folderId
        },
        select: {
            ownerId: true
        }
    });
    if (!res) return false;
    return (res.ownerId === userId);
}

export default { isMyFolder };