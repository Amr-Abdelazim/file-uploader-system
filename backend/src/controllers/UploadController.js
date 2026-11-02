import fs from 'fs';
import CustomError from '../utils/CustomError.js';
import fileService from '../services/fileService.js';
import UploadService from '../services/UploadService.js';
import StorageService from '../services/StorageService.js';

async function startSession(req, res, next) {
  const fileId = await fileService.createFile(req.body, req.user.userId);
  const session = await UploadService.createUploadSession(fileId);
  res.json({
    success: true,
    fileId,
    sessionId: session.id,
    status: session.status
  })

}

async function uploadChunk(req, res, next) {
  try {

    const session = await UploadService.getUploadSession(req.body.sessionId);

    if (!session) {
      return next(new CustomError("Session not found", 404));
    }

    if (session.status !== "uploading") {
      return next(
        new CustomError(
          `Session in ${session.status} status can't accept uploads`,
          400
        )
      );
    }


    console.log(req.body);

    const metaData = {
      sessionId: req.body.sessionId,
      fileId: req.body.fileId,
      chunkIndex: req.body.chunkIndex,
      chunkSize: req.body.size,
      tempPath: req.body.tempPath
    };

    const chunkFile = await StorageService.saveChunk(
      metaData
    );

    return res.json({
      success: true,
      chunkIndex: chunkFile.index
    });

  } catch (err) {
    next(err);
  }
}


async function finalizeUpload(req, res, next) {
  const session = await UploadService.getUploadSession(req.body.sessionId);
  const result = await StorageService.mergeChunks(session.fileId);

  res.json({
    success: true,
    fileId: session.fileId,
    sessionId: session.id,
    status: 'done',
    mergedFilePath: result?.mergedFilePath
  });
}

async function sessionUploadStatus(req, res, next) {
  const session = await UploadService.getUploadSession(req.params.sessionId);
  const fileStatus = await fileService.getFileUploadStatus(session.fileId);
  res.json({
    success: true,
    status: session.status,
    ...fileStatus
  });
}

export default { startSession, uploadChunk, finalizeUpload, sessionUploadStatus }; 