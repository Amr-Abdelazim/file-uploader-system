import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import UploadController from '../src/controllers/UploadController.js';
import fileService from '../src/services/fileService.js';
import UploadService from '../src/services/UploadService.js';
import StorageService from '../src/services/StorageService.js';
import prisma from '../src/utils/prisma.js';
import CustomError from '../src/utils/CustomError.js';

function createMockRes() {
    return {
        statusCode: 200,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.payload = data;
            return this;
        }
    };
}

const originalFileService = {
    createFile: fileService.createFile,
    getFileUploadStatus: fileService.getFileUploadStatus
};
const originalUploadService = {
    createUploadSession: UploadService.createUploadSession,
    getUploadSession: UploadService.getUploadSession
};
const originalStorageService = {
    saveChunk: StorageService.saveChunk,
    mergeChunks: StorageService.mergeChunks
};
const originalPrisma = {
    uploadSession: {
        findUnique: prisma.uploadSession.findUnique,
        findFirst: prisma.uploadSession.findFirst,
        create: prisma.uploadSession.create,
        update: prisma.uploadSession.update
    },
    file: {
        findUnique: prisma.file.findUnique,
        update: prisma.file.update,
        create: prisma.file.create
    },
    chunkFile: {
        findFirst: prisma.chunkFile.findFirst,
        create: prisma.chunkFile.create,
        update: prisma.chunkFile.update,
        findMany: prisma.chunkFile.findMany
    },
    $transaction: prisma.$transaction
};

function restoreMocks() {
    fileService.createFile = originalFileService.createFile;
    fileService.getFileUploadStatus = originalFileService.getFileUploadStatus;
    UploadService.createUploadSession = originalUploadService.createUploadSession;
    UploadService.getUploadSession = originalUploadService.getUploadSession;
    StorageService.saveChunk = originalStorageService.saveChunk;
    StorageService.mergeChunks = originalStorageService.mergeChunks;
    prisma.uploadSession.findUnique = originalPrisma.uploadSession.findUnique;
    prisma.uploadSession.findFirst = originalPrisma.uploadSession.findFirst;
    prisma.uploadSession.create = originalPrisma.uploadSession.create;
    prisma.uploadSession.update = originalPrisma.uploadSession.update;
    prisma.file.findUnique = originalPrisma.file.findUnique;
    prisma.file.update = originalPrisma.file.update;
    prisma.file.create = originalPrisma.file.create;
    prisma.chunkFile.findFirst = originalPrisma.chunkFile.findFirst;
    prisma.chunkFile.create = originalPrisma.chunkFile.create;
    prisma.chunkFile.update = originalPrisma.chunkFile.update;
    prisma.chunkFile.findMany = originalPrisma.chunkFile.findMany;
    prisma.$transaction = originalPrisma.$transaction;
}

function selectFields(item, select) {
    if (!select) return { ...item };
    return Object.fromEntries(Object.entries(select).filter(([_, value]) => value).map(([key]) => [key, item[key]]));
}

function createPrismaState() {
    return {
        uploadSessions: [],
        files: [],
        chunkFiles: []
    };
}

function installPrismaMocks(state) {
    prisma.uploadSession.findUnique = async ({ where, select }) => {
        const session = state.uploadSessions.find((item) => item.id === where.id || item.fileId === where.fileId);
        return session ? selectFields(session, select) : null;
    };

    prisma.uploadSession.findFirst = async ({ where, select }) => {
        const session = state.uploadSessions.find((item) => item.fileId === where.fileId);
        return session ? selectFields(session, select) : null;
    };

    prisma.uploadSession.create = async ({ data, select }) => {
        const record = { id: data.id || `sess-${state.uploadSessions.length + 1}`, ...data };
        state.uploadSessions.push(record);
        return selectFields(record, select);
    };

    prisma.uploadSession.update = async ({ where, data, select }) => {
        const session = state.uploadSessions.find((item) => item.id === where.id || item.fileId === where.fileId);
        if (!session) return null;
        Object.assign(session, data);
        return selectFields(session, select);
    };

    prisma.file.findUnique = async ({ where, select }) => {
        const file = state.files.find((item) => item.id === where.id);
        return file ? selectFields(file, select) : null;
    };

    prisma.file.update = async ({ where, data, select }) => {
        const file = state.files.find((item) => item.id === where.id);
        if (!file) return null;
        for (const [key, value] of Object.entries(data)) {
            if (value && typeof value === 'object' && 'increment' in value) {
                file[key] = (file[key] || 0) + value.increment;
            } else {
                file[key] = value;
            }
        }
        return selectFields(file, select);
    };

    prisma.file.create = async ({ data, select }) => {
        const file = { id: data.id || `file-${state.files.length + 1}`, ...data };
        state.files.push(file);
        return selectFields(file, select);
    };

    prisma.chunkFile.findFirst = async ({ where, select }) => {
        const chunk = state.chunkFiles.find((item) => item.fileId === where.fileId && item.index === where.index);
        return chunk ? selectFields(chunk, select) : null;
    };

    prisma.chunkFile.create = async ({ data, select }) => {
        const chunk = { id: data.id || `chunk-${state.chunkFiles.length + 1}`, ...data };
        state.chunkFiles.push(chunk);
        return selectFields(chunk, select);
    };

    prisma.chunkFile.update = async ({ where, data, select }) => {
        const chunk = state.chunkFiles.find((item) => item.id === where.id);
        if (!chunk) return null;
        Object.assign(chunk, data);
        return selectFields(chunk, select);
    };

    prisma.chunkFile.findMany = async ({ where, select, orderBy }) => {
        const chunks = state.chunkFiles
            .filter((item) => item.fileId === where.fileId && (where.uploaded === undefined || item.uploaded === where.uploaded));
        if (orderBy?.index === 'asc') {
            chunks.sort((a, b) => a.index - b.index);
        }
        return chunks.map((chunk) => selectFields(chunk, select));
    };

    prisma.$transaction = async (operations) => Promise.all(operations);
}

async function withTempCwd(fn) {
    const originalCwd = process.cwd();
    const tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'upload-test-'));
    await fsp.mkdir(path.join(tempDir, 'Storage', 'temp', 'uploads'), { recursive: true });
    await fsp.mkdir(path.join(tempDir, 'Storage', 'saved', 'uploads'), { recursive: true });
    await fsp.mkdir(path.join(tempDir, 'Storage', 'merged'), { recursive: true });
    process.chdir(tempDir);

    try {
        await fn(tempDir);
    } finally {
        process.chdir(originalCwd);
        await fsp.rm(tempDir, { recursive: true, force: true });
    }
}

test.afterEach(() => {
    restoreMocks();
});

test('startSession returns created file and upload session', async () => {
    fileService.createFile = async (fileData, ownerId) => {
        assert.equal(ownerId, 'user-123');
        assert.equal(fileData.name, 'video.mp4');
        return 'file-abc';
    };

    UploadService.createUploadSession = async (fileId) => {
        assert.equal(fileId, 'file-abc');
        return { id: 'session-123', status: 'uploading' };
    };

    const req = {
        body: {
            name: 'video.mp4',
            size: 2048,
            totalChunks: 4,
            folderId: 'folder-1',
            mimetype: 'video/mp4',
            resourceType: 'video'
        },
        user: { userId: 'user-123' }
    };
    const res = createMockRes();

    await UploadController.startSession(req, res, () => { });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, {
        success: true,
        fileId: 'file-abc',
        sessionId: 'session-123',
        status: 'uploading'
    });
});

test('uploadChunk forwards chunk metadata and returns chunk index', async () => {
    UploadService.getUploadSession = async (sessionId) => {
        assert.equal(sessionId, 'session-123');
        return { id: 'session-123', fileId: 'file-abc', status: 'uploading' };
    };

    StorageService.saveChunk = async (metaData) => {
        assert.equal(metaData.sessionId, 'session-123');
        assert.equal(metaData.fileId, 'file-abc');
        assert.equal(metaData.chunkIndex, 2);
        assert.equal(metaData.chunkSize, 512);
        assert.equal(metaData.tempPath, '/tmp/chunk-2.tmp');
        return { index: 2 };
    };

    const req = {
        body: {
            sessionId: 'session-123',
            fileId: 'file-abc',
            chunkIndex: 2,
            size: 512,
            tempPath: '/tmp/chunk-2.tmp'
        }
    };
    const res = createMockRes();

    await UploadController.uploadChunk(req, res, () => { });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, { success: true, chunkIndex: 2 });
});

test('sessionUploadStatus returns upload status and chunk info', async () => {
    UploadService.getUploadSession = async (sessionId) => {
        assert.equal(sessionId, 'session-123');
        return { id: 'session-123', fileId: 'file-abc', status: 'uploading' };
    };

    fileService.getFileUploadStatus = async (fileId) => {
        assert.equal(fileId, 'file-abc');
        return { totalChunks: 4, uploadedChunks: [0, 1] };
    };

    const req = { params: { sessionId: 'session-123' } };
    const res = createMockRes();

    await UploadController.sessionUploadStatus(req, res, () => { });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, {
        success: true,
        status: 'uploading',
        totalChunks: 4,
        uploadedChunks: [0, 1]
    });
});

test('finalizeUpload merges chunks and returns session done status', async () => {
    UploadService.getUploadSession = async (sessionId) => {
        assert.equal(sessionId, 'session-123');
        return { id: 'session-123', fileId: 'file-abc', status: 'uploading' };
    };

    StorageService.mergeChunks = async (fileId) => {
        assert.equal(fileId, 'file-abc');
        return { mergedFilePath: 'Storage/merged/file-abc.mp4' };
    };

    const req = { body: { sessionId: 'session-123' } };
    const res = createMockRes();

    await UploadController.finalizeUpload(req, res, () => { });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, {
        success: true,
        fileId: 'file-abc',
        sessionId: 'session-123',
        status: 'done',
        mergedFilePath: 'Storage/merged/file-abc.mp4'
    });
});

test('uploadChunk returns 404 when session id is invalid', async () => {
    UploadService.getUploadSession = async () => {
        throw new CustomError('Invalid SessionId', 404);
    };

    const req = {
        body: {
            sessionId: 'missing-session',
            fileId: 'file-abc',
            chunkIndex: 0,
            size: 1024,
            tempPath: '/tmp/does-not-matter'
        }
    };
    const res = createMockRes();
    let caught;

    await UploadController.uploadChunk(req, res, (err) => {
        caught = err;
    });

    assert.ok(caught instanceof CustomError);
    assert.equal(caught.statusCode, 404);
});

test('finalizeUpload rejects when merge fails due to missing chunks', async () => {
    UploadService.getUploadSession = async () => ({ id: 'session-123', fileId: 'file-abc', status: 'uploading' });
    StorageService.mergeChunks = async () => {
        throw new CustomError('Missing chunks', 400);
    };

    const req = { body: { sessionId: 'session-123' } };
    const res = createMockRes();

    await assert.rejects(async () => {
        await UploadController.finalizeUpload(req, res, () => { });
    }, (err) => {
        assert.ok(err instanceof CustomError);
        assert.equal(err.statusCode, 400);
        return true;
    });
});

test('StorageService can save out-of-order chunks and merge them end-to-end', async () => {
    await withTempCwd(async (tempDir) => {
        const state = createPrismaState();
        const fileRecord = {
            id: 'file-1',
            name: 'video.txt',
            mimetype: 'text/plain',
            size: 10,
            path: null,
            totalChunks: 2,
            uploadedChunks: 0,
            isComplete: false,
            ownerId: 'user-123'
        };
        state.files.push(fileRecord);
        state.uploadSessions.push({ id: 'session-1', fileId: 'file-1', status: 'uploading' });
        installPrismaMocks(state);

        const chunkPath0 = path.join(tempDir, 'chunk0.tmp');
        const chunkPath1 = path.join(tempDir, 'chunk1.tmp');
        await fsp.writeFile(chunkPath1, 'BBBB');
        await fsp.writeFile(chunkPath0, 'AAAA');

        await StorageService.saveChunk({ sessionId: 'session-1', fileId: 'file-1', chunkIndex: 1, chunkSize: 4, tempPath: chunkPath1 });
        await StorageService.saveChunk({ sessionId: 'session-1', fileId: 'file-1', chunkIndex: 0, chunkSize: 4, tempPath: chunkPath0 });

        assert.equal(state.files[0].uploadedChunks, 2);

        const result = await StorageService.mergeChunks('file-1');
        assert.ok(result.mergedFilePath.includes(path.join('Storage', 'merged')));
        await fsp.access(result.mergedFilePath, fs.constants.R_OK);

        const mergedContent = await fsp.readFile(result.mergedFilePath, 'utf8');
        assert.equal(mergedContent, 'AAAABBBB');
        assert.equal(state.files[0].isComplete, true);
        assert.equal(state.uploadSessions[0].status, 'done');
    });
});

test('StorageService rejects duplicate chunk uploads', async () => {
    await withTempCwd(async () => {
        const state = createPrismaState();
        state.files.push({
            id: 'file-2',
            name: 'duplicate.txt',
            mimetype: 'text/plain',
            size: 4,
            path: null,
            totalChunks: 1,
            uploadedChunks: 1,
            isComplete: false,
            ownerId: 'user-123'
        });
        state.uploadSessions.push({ id: 'session-dup', fileId: 'file-2', status: 'uploading' });
        state.chunkFiles.push({
            id: 'chunk-1',
            fileId: 'file-2',
            index: 0,
            size: 4,
            path: path.join('Storage', 'saved', 'uploads', 'file-2', '0.chunk'),
            uploaded: true
        });
        installPrismaMocks(state);

        const tempChunk = path.join(process.cwd(), 'duplicate.tmp');
        await fsp.writeFile(tempChunk, 'DATA');

        let caught;
        try {
            await StorageService.saveChunk({ sessionId: 'session-dup', fileId: 'file-2', chunkIndex: 0, chunkSize: 4, tempPath: tempChunk });
        } catch (err) {
            caught = err;
        }

        assert.ok(caught instanceof CustomError);
        assert.equal(caught.statusCode, 409);
    });
});

test('StorageService mergeChunks fails when upload is incomplete', async () => {
    await withTempCwd(async () => {
        const state = createPrismaState();
        state.files.push({
            id: 'file-3',
            name: 'incomplete.txt',
            mimetype: 'text/plain',
            size: 8,
            path: null,
            totalChunks: 2,
            uploadedChunks: 1,
            isComplete: false,
            ownerId: 'user-123'
        });
        state.uploadSessions.push({ id: 'session-incomplete', fileId: 'file-3', status: 'uploading' });
        state.chunkFiles.push({
            id: 'chunk-3',
            fileId: 'file-3',
            index: 0,
            size: 4,
            path: path.join('Storage', 'saved', 'uploads', 'file-3', '0.chunk'),
            uploaded: true
        });
        installPrismaMocks(state);

        await assert.rejects(async () => {
            await StorageService.mergeChunks('file-3');
        }, (err) => {
            assert.ok(err instanceof CustomError);
            assert.equal(err.statusCode, 400);
            return true;
        });
    });
});

test('fileService getFileUploadStatus reports uploaded chunk indexes', async () => {
    const state = createPrismaState();
    state.files.push({ id: 'file-status', totalChunks: 3 });
    state.chunkFiles.push({ fileId: 'file-status', index: 0, uploaded: true });
    state.chunkFiles.push({ fileId: 'file-status', index: 2, uploaded: true });
    installPrismaMocks(state);

    const status = await fileService.getFileUploadStatus('file-status');
    assert.deepEqual(status, { totalChunks: 3, uploadedChunks: [0, 2] });
});
