import userService from "../services/userService.js";
import UploadService from "../services/UploadService.js";
import CustomError from "../utils/CustomError.js";
async function folderEdit(req, res, next) {
    const ok = await userService.canEditFolder(req.user.userId, req.body.folderId);

    if (!ok) {
        return res.status(403).json({ message: "Permission denied" });
    }

    next();
}
async function sessionAccess(req, res, next) {
    let sessionId = req.params.sessionId;
    if (!sessionId) sessionId = req.body.sessionId
    if (!sessionId) throw new CustomError("sessionId required", 400);
    const session = await UploadService.getUploadSession(sessionId);
    const ok = await userService.isMyFile(req.user.userId, session.fileId);
    if (!ok) {
        return res.status(403).json({ message: "Permission denied" });
    }

    next();
}

export default {
    folderEdit,
    sessionAccess
}