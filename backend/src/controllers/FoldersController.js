import folderService from "../services/folderService.js";

async function getRoot(req, res, next) {
    res.json(await folderService.getRoot(req.user.userId));
}
async function getFolderPath(req, res, next) {
    const maxPathLength = req.query.pathLength || 5;
    const folderId = req.params.folderId;
    console.log('hi');
    const ans = await folderService.getFolderPath(folderId, maxPathLength);
    res.json(ans);
}
export default { getRoot, getFolderPath };