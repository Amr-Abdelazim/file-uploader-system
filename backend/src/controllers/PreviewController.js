import folderService from "../services/folderService.js";

async function folderPreview(req, res, next) {
    const ans = await folderService.folderPreview(req.params.folderId);
    console.log(ans);
    res.json(ans);
}

export default { folderPreview };