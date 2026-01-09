import folderService from "../services/folderService.js";

async function folderPreview(req, res, next) {
    res.json(await folderService.folderPreview(req.params.folderId));
}

export default { folderPreview };