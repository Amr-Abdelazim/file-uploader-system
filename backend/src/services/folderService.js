import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';
import Trie from '../utils/Trie.js';
import fileService from './fileService.js';



async function createFolder(parentId, folderName, ownerId) {

    if (parentId) {
        const parent = await prisma.folder.findUnique({
            where: { id: parentId },
            select: { ownerId: true }
        });

        if (!parent)
            throw new CustomError("Invalid parentId", 400);

        if (parent.ownerId !== ownerId)
            throw new CustomError("Not allowed", 403);
    }

    const createdFolder = await prisma.folder.create({
        data: {
            name: folderName,
            ownerId,
            parentId: parentId || null
        },
        select: { id: true }
    });

    return createdFolder.id;
}



async function getFolder(folderId) {
    const res = await prisma.folder.findUnique({
        where: { id: folderId },
        select: {
            id: true,
            name: true,
            size: true,
            createdAt: true,
            parentId: true,
            visibility: true
        }
    });

    if (!res)
        throw new CustomError(`Folder id ${folderId} not found!!`, 404);

    return res;
}

async function updateFolderName(folderId, name) {
    if (!name || !name.trim()) {
        throw new CustomError('Folder name is required', 400);
    }

    const folder = await prisma.folder.update({
        where: { id: folderId },
        data: { name },
        select: {
            id: true,
            name: true,
            size: true,
            createdAt: true,
            parentId: true,
            visibility: true
        }
    });

    return folder;
}

async function deleteFolder(folderId) {
    const [childFoldersCount, childFilesCount] = await Promise.all([
        prisma.folder.count({ where: { parentId: folderId } }),
        prisma.file.count({ where: { folderId } })
    ]);

    if (childFoldersCount > 0 || childFilesCount > 0) {
        throw new CustomError('Folder is not empty', 400);
    }

    await prisma.folder.delete({ where: { id: folderId } });
    return true;
}

async function getChilds(folderId) {
    const [folders, files] = await Promise.all([
        prisma.folder.findMany({
            where: { parentId: folderId },
            select: {
                id: true,
                name: true,
                size: true,
                createdAt: true,
                visibility: true
            }
        }),
        prisma.file.findMany({
            where: { folderId },
            select: {
                id: true,
                name: true,
                size: true,
                mimetype: true,
                resourceType: true,
                createdAt: true,
                visibility: true
            }
        })
    ]);

    return {
        folders,
        files
    };
}



async function folderPreview(folderId) {
    const { folders, files } = await getChilds(folderId);
    return folders.concat(files);
}



async function sizeProp(folderId, size) {
    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { parentId: true }
    });

    if (!folder) return;

    await prisma.folder.update({
        where: { id: folderId },
        data: {
            size: { increment: size }
        }
    });

    if (folder.parentId) {
        await sizeProp(folder.parentId, size);
    }
}



async function resolvePaths(relativeRootId, paths, ownerId) {
    const trie = new Trie(relativeRootId);
    const resolvedPathes = [];

    for (const path of paths) {
        resolvedPathes.push(
            await trie.addPathArray(path, (parentId, name) =>
                createFolder(parentId, name, ownerId)
            )
        );
    }

    return resolvedPathes;
}



async function getRoot(userId) {
    const root = await prisma.folder.findFirst({
        where: {
            ownerId: userId,
            parentId: null
        },
        select: {
            id: true
        }
    });

    if (!root)
        throw new CustomError("Root folder not found", 404);

    return root;
}



async function getFolderPath(folderId, maxDepth = 10) {
    const path = [];

    let currentId = folderId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
        const folder = await prisma.folder.findUnique({
            where: { id: currentId },
            select: {
                id: true,
                name: true,
                parentId: true
            }
        });

        if (!folder) break;

        path.unshift({
            folderId: folder.id,
            name: folder.name
        });

        currentId = folder.parentId;
        depth++;
    }

    return path;
}


export default {
    resolvePaths,
    createFolder,
    folderPreview,
    sizeProp,
    getRoot,
    getFolderPath,
    getChilds,
    getFolder
};