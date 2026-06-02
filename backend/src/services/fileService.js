import fs from 'fs';
import path from 'path';
import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';
import folderService from './folderService.js';


async function createFile(fileData, ownerId) {
    const createdFile = await prisma.file.create({
        data: {
            ...fileData
            ,
            ownerId
        },
        select: {
            id: true,
            folderId: true
        }
    });

    await folderService.sizeProp(createdFile.folderId, fileData.size);
    return createdFile.id;
}

async function createFiles(relativeRootId, filesData, paths, ownerId) {
    const pathsArray = paths.map(path => {
        if (!path || path.trim() === "")
            throw new CustomError("Empty path", 400);
        const arr = path.split('/');
        arr.pop();
        return arr;
    });
    const resolvedPathes = await folderService.resolvePaths(relativeRootId, pathsArray, ownerId);
    for (const idx in filesData) {
        await createFile({ folderId: resolvedPathes[idx], ...filesData[idx] }, ownerId);
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
            mimetype: true,
            size: true,
            path: true,
            hash: true,
            createdAt: true
        }
    });
    if (!res) throw new CustomError(`File with id ${fileId} not found!!`, 404);
    return res;

}
async function getFileUploadStatus(fileId) {
    const [uploadedChunksResult, file] = await Promise.all([
        prisma.chunkFile.findMany({
            where: {
                fileId,
                uploaded: true,
            },
            select: {
                index: true,
            },
            orderBy: {
                index: 'asc',
            },
        }),
        prisma.file.findUnique({
            where: { id: fileId },
            select: {
                totalChunks: true,
            },
        }),
    ]);

    if (!file) {
        throw new Error('File not found');
    }

    const uploadedChunks = uploadedChunksResult.map(
        (chunk) => chunk.index
    );

    return {
        totalChunks: file.totalChunks,
        uploadedChunks,
    };
}

async function updateFileName(fileId, name) {
    if (!name || !name.trim()) {
        throw new CustomError('File name is required', 400);
    }
    const file = await prisma.file.update({
        where: { id: fileId },
        data: { name },
        select: {
            id: true,
            name: true,
            resourceType: true,
            mimetype: true,
            size: true,
            path: true,
            folderId: true,
            ownerId: true,
            totalChunks: true,
            uploadedChunks: true,
            isComplete: true,
            visibility: true,
            createdAt: true
        }
    });
    return file;
}

async function deleteFile(fileId) {
    const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: {
            id: true,
            folderId: true,
            size: true,
            path: true
        }
    });

    if (!file) {
        throw new CustomError(`File with id ${fileId} not found!!`, 404);
    }

    const deletePaths = [];
    if (file.path) {
        deletePaths.push(file.path);
    }
    deletePaths.push(path.join('Storage', 'saved', 'uploads', fileId));

    for (const deletePath of deletePaths) {
        try {
            await fs.promises.rm(deletePath, { recursive: true, force: true });
        } catch (err) {
            // ignore cleanup failures
        }
    }

    await prisma.file.delete({ where: { id: fileId } });

    const folderId = file.folderId;
    const sizeDelta = typeof file.size === 'bigint' ? file.size * BigInt(-1) : -Number(file.size);
    await folderService.sizeProp(folderId, sizeDelta);

    return true;
}

export default { createFile, createFiles, getFile, getFileUploadStatus, updateFileName, deleteFile };