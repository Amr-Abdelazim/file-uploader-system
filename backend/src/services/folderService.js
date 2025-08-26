import prisma from '../utils/prisma.js';
import CustomError from '../utils/CustomError.js';
import Trie from '../utils/Trie.js';

async function createFolder(parentId, folderName) {
    const owner = await prisma.folder.findUnique({ where: { id: parentId }, select: { ownerId: true } });
    if (!owner)
        throw new CustomError("Invalid parentId", 400);
    const createdFolder = await prisma.folder.create({ data: { name: folderName, ownerId: owner.ownerId }, select: { id: true } });
    await prisma.children.create({ data: { folderId: parentId, objectId: createdFolder.id, isFile: false } });
    return createdFolder.id;
}

async function resolvePaths(relativeRootId, paths) {
    const trie = new Trie(relativeRootId);
    const resolvedPathes = [];
    for (const path of paths) {
        resolvedPathes.push(await trie.addPathArray(path, createFolder));
    }
    return resolvedPathes;
}



export default { resolvePaths, createFolder };

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