import fs from 'fs';
import fileService from '../services/fileService.js';
import CustomError from "../utils/CustomError.js";
import { pipeline } from 'stream';
import { promisify } from 'util';
const streamPipeline = promisify(pipeline);

async function downloadFile(req, res, next) {
    const file = await fileService.getFile(req.params.fileId);
    if (!file.path) {
        throw new CustomError('File is not available for download', 404);
    }

    await fs.promises.access(file.path, fs.constants.R_OK);
    const fileStats = await fs.promises.stat(file.path);
    const fileSize = fileStats.size;
    const rangeHeader = req.headers.range;
    const contentType = file.mimetype || 'application/octet-stream';
    const fileName = encodeURIComponent(file.name);
    const isInline = req.query.inline === 'true' || req.query.preview === 'true';
    const dispositionType = isInline ? 'inline' : 'attachment';
    const etag = file.hash ? `"${file.hash}"` : `W/"${fileSize}-${Math.floor(fileStats.mtimeMs)}"`;

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${dispositionType}; filename="${fileName}"`);
    res.setHeader('ETag', etag);
    res.setHeader('Last-Modified', fileStats.mtime.toUTCString());

    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch) {
        const requestedEtags = ifNoneMatch.split(',').map(tag => tag.trim());
        if (requestedEtags.includes(etag) || requestedEtags.includes('*')) {
            res.status(304).end();
            return;
        }
    }

    const getRangeBounds = (header) => {
        const rangeMatch = header.match(/^bytes=(\d*)-(\d*)$/);
        if (!rangeMatch) {
            return null;
        }

        const startHeader = rangeMatch[1];
        const endHeader = rangeMatch[2];

        if (startHeader === '' && endHeader === '') {
            return null;
        }

        if (startHeader === '') {
            const suffixLength = parseInt(endHeader, 10);
            if (Number.isNaN(suffixLength) || suffixLength <= 0) {
                return null;
            }
            const start = Math.max(fileSize - suffixLength, 0);
            return { start, end: fileSize - 1 };
        }

        const start = parseInt(startHeader, 10);
        if (Number.isNaN(start) || start < 0) {
            return null;
        }

        const end = endHeader ? parseInt(endHeader, 10) : fileSize - 1;
        if (Number.isNaN(end) || end < 0) {
            return null;
        }

        return { start, end };
    };

    if (!rangeHeader) {
        res.setHeader('Content-Length', fileSize);
        res.status(200);
        const readStream = fs.createReadStream(file.path);
        const abortHandler = () => readStream.destroy();
        req.on('aborted', abortHandler);
        res.on('close', abortHandler);

        try {
            await streamPipeline(readStream, res);
        } catch (err) {
            if (req.aborted) {
                return;
            }
            throw err;
        } finally {
            req.off('aborted', abortHandler);
            res.off('close', abortHandler);
        }
        return;
    }

    const range = getRangeBounds(rangeHeader);
    if (!range) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        throw new CustomError('Invalid Range header', 416);
    }

    let { start, end } = range;
    if (start >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        throw new CustomError('Requested range not satisfiable', 416);
    }

    if (end >= fileSize) {
        end = fileSize - 1;
    }

    if (start > end) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        throw new CustomError('Requested range not satisfiable', 416);
    }

    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Content-Length', chunkSize);

    const readStream = fs.createReadStream(file.path, { start, end });
    const abortHandler = () => readStream.destroy();
    req.on('aborted', abortHandler);
    res.on('close', abortHandler);

    try {
        await streamPipeline(readStream, res);
    } catch (err) {
        if (req.aborted) {
            return;
        }
        throw err;
    } finally {
        req.off('aborted', abortHandler);
        res.off('close', abortHandler);
    }
}

async function getFileInfo(req, res, next) {
    const file = await fileService.getFile(req.params.fileId);
    res.json({ success: true, file });
}

async function renameFile(req, res, next) {
    const file = await fileService.updateFileName(req.params.fileId, req.body.name);
    res.json({ success: true, file });
}

async function deleteFile(req, res, next) {
    await fileService.deleteFile(req.params.fileId);
    res.json({ success: true });
}

export default { downloadFile, getFileInfo, renameFile, deleteFile };