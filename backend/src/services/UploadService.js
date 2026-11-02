import CustomError from '../utils/CustomError.js';
import prisma from '../utils/prisma.js';


async function createUploadSession(fileId) {
    const session = await prisma.uploadSession.create({
        data: {
            fileId
        },
        select: {
            id: true,
            status: true
        }
    });
    return session;
}

async function getUploadSession(sessionId) {
    const session = await prisma.uploadSession.findUnique({
        where: {
            id: sessionId
        },
        select: {
            id: true,
            fileId: true,
            status: true
        }
    });
    if (!session)
        throw new CustomError("Invalid SessionId", 404);
    return session;
}

export default {
    createUploadSession,
    getUploadSession
}