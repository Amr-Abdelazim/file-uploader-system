import folderService from "../services/folderService.js";

async function createFolder(req, res, next) {
    const parentId = req.body.parentId || null;
    const folderName = req.body.name;
    const folderId = await folderService.createFolder(parentId, folderName, req.user.userId);
    res.json({ success: true, folderId });
}

async function getFolder(req, res, next) {
    const folderId = req.params.folderId;
    const folder = await folderService.getFolder(folderId);
    const children = await folderService.getChilds(folderId);
    res.json({ success: true, folder, children });
}

async function updateFolder(req, res, next) {
    const folderId = req.params.folderId;
    const name = req.body.name;
    const folder = await folderService.updateFolderName(folderId, name);
    res.json({ success: true, folder });
}

async function deleteFolder(req, res, next) {
    const folderId = req.params.folderId;
    await folderService.deleteFolder(folderId);
    res.json({ success: true });
}

async function getRoot(req, res, next) {
    res.json(await folderService.getRoot(req.user.userId));
}

async function getFolderPath(req, res, next) {
    const maxPathLength = req.query.pathLength || 5;
    const folderId = req.params.folderId;
    const ans = await folderService.getFolderPath(folderId, maxPathLength);
    res.json(ans);
}

export default { createFolder, getFolder, updateFolder, deleteFolder, getRoot, getFolderPath };