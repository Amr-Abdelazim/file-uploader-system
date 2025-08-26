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
    console.log("**********************", parentId);
    await prisma.children.create({
        data: {
            folderId: parentId,
            objectId: createdFile.id,
            isFile: true
        }
    });
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
    console.log(resolvedPathes);
    for (const idx in filesData) {
        await createFile(resolvedPathes[idx], filesData[idx]);
    }
}

export default { createFile, createFiles };