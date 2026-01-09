import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';
import folderService from './folderService.js';


async function createFile(parentId, fileData) {
    const createdFile = await prisma.file.create({
        data: {
            ...fileData
        },
        select: {
            id: true
        }
    });
    await prisma.children.create({
        data: {
            folderId: parentId,
            objectId: createdFile.id,
            isFile: true
        }
    });
    await folderService.sizeProp(createdFile.id, fileData.size);
    return createdFile.id;
}

async function createFiles(relativeRootId, filesData, paths) {
    const pathsArray = paths.map(path => {
        if (!path || path.trim() === "")
            throw CustomError("Empty path", 400);
        const arr = path.split('/');
        arr.pop();
        return arr;
    });
    const resolvedPathes = await folderService.resolvePaths(relativeRootId, pathsArray);
    for (const idx in filesData) {
        await createFile(resolvedPathes[idx], filesData[idx]);
    }
}
async function getFile(fileId) {
    const res = await prisma.file.findUnique({
        where: {
            id: fileId
        },
        select: {
            id: true,
            name: true,
            resourceType: true,
            public_id: true,
            size: true,
            createdAt: true
        }
    });
    if (!res) throw CustomError(`File with id ${fileId} not found!!`, 404);
    return res;

}
async function getPublicId(fileId) {
    const res = await prisma.file.findUnique({
        where: {
            id: fileId
        },
        select: {
            public_id: true
        }
    });
    if (!res) throw CustomError(`File with id ${fileId} not found!!`, 404);
    return res.public_id;
}
export default { createFile, createFiles, getFile, getPublicId };