import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';
import Trie from '../utils/Trie.js';
import fileService from './fileService.js';

async function createFolder(parentId, folderName) {
    const owner = await prisma.folder.findUnique({ where: { id: parentId }, select: { ownerId: true } });
    if (!owner)
        throw new CustomError("Invalid parentId", 400);
    const createdFolder = await prisma.folder.create({ data: { name: folderName, ownerId: owner.ownerId }, select: { id: true } });
    await prisma.children.create({ data: { folderId: parentId, objectId: createdFolder.id, isFile: false } });
    return createdFolder.id;
}
async function getFolder(folderId) {
    const res = await prisma.folder.findUnique({
        where: {
            id: folderId
        },
        select: {
            id: true,
            name: true,
            size: true,
            createdAt: true
        }
    });
    if (!res) throw CustomError(`Folder id ${folderId} not found!!`, 404);
    return res;
}
async function getFolderName(folderId) {
    const res = await prisma.folder.findUnique({
        where: {
            id: folderId
        },
        select: {
            name: true
        }
    });
    if (!res) throw CustomError(`Folder id ${folderId} not found!!`, 404);
    return res.name;
}
async function getChilds(folderId) {
    const res = await prisma.children.findMany({
        where: {
            folderId: folderId
        },
        select: {
            objectId: true,
            isFile: true
        }
    });
    if (!res) return [];
    return res;
}
async function folderPreview(folderId) {
    const res = await getChilds(folderId);
    const ans = [];
    for (const obj of res) {
        let cur = {};
        if (obj.isFile) {
            cur = await fileService.getFile(obj.objectId);
        } else {
            cur = await getFolder(obj.objectId);
        }
        cur.isFile = obj.isFile;
        ans.push(cur);
    }

    return ans;
}
async function sizeProp(objectId, size) {

    const res = await prisma.children.findFirst({
        where: {
            objectId: objectId
        },
        select: {
            folderId: true
        }
    });
    if (!res) return;
    await prisma.folder.update({
        where: {
            id: res.folderId
        },
        data: {
            size: { increment: size }
        }
    });
    await sizeProp(res.folderId, size);

}

async function resolvePaths(relativeRootId, paths) {
    const trie = new Trie(relativeRootId);
    const resolvedPathes = [];
    for (const path of paths) {
        resolvedPathes.push(await trie.addPathArray(path, createFolder));
    }
    return resolvedPathes;
}

async function getRoot(userId) {
    const res = await prisma.root.findFirst({
        where: {
            userId
        },
        select: {
            folderId: true
        }
    });
    if (!res) throw CustomError("invalid userId!!", 404);
    return res;
}

async function getFolderPath(folderId, maxPathLength = 5) {
    const ans = [{ folderId, name: await getFolderName(folderId) }];
    maxPathLength--;
    while (maxPathLength > 0) {
        const cur = ans[ans.length - 1].folderId;
        const res = await prisma.children.findFirst({
            where: {
                objectId: cur
            },
            select: {
                folderId: true
            }
        });
        if (!res) return ans;
        ans.push({ folderId: res.folderId, name: await getFolderName(res.folderId) });
        maxPathLength--;
    }
    return ans;

}
export default {
    resolvePaths,
    createFolder,
    folderPreview,
    sizeProp,
    getRoot,
    getFolderPath
};

// rootId:640981d9-c7a0-491c-b130-f427df8ac2fb
/*
async function main() {
    console.log(await resolvePaths("640981d9-c7a0-491c-b130-f427df8ac2fb", [
        ["amr", "ali", "kareem"],
        ["amr", "ali", "kareem"],
        ["amr", "ali", "ddd"],
        ["amr", "ddd", "kareem"]
    ]));
}


(
    async () => {
        await main();
    }
)();*/ 