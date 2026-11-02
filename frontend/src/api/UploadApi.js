import client from './client';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

class UploadApi {
    async createSession(folderId, fileName, fileSize, mimeType) {
        const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
        return client.request('/api/upload/session', {
            method: 'POST',
            body: {
                folderId,
                name: fileName,
                size: fileSize,
                totalChunks,
                mimetype: mimeType
            }
        });
    }

    async uploadChunk(sessionId, fileId, chunkIndex, chunk, chunkSize) {
        const formData = new FormData();
        formData.append('sessionId', sessionId);
        formData.append('fileId', fileId);
        formData.append('chunkIndex', chunkIndex);
        formData.append('size', chunkSize);
        formData.append('file', chunk);

        const res = await client.request('/api/upload/chunk', {
            method: 'POST',
            body: formData,
            raw: true
        });
        return res.status === 200 || res.status === 201;
    }

    async finalizeUpload(sessionId, fileId) {
        return client.request('/api/upload/finalize', {
            method: 'POST',
            body: { sessionId, fileId }
        });
    }

    async getUploadStatus(sessionId) {
        return client.request(`/api/upload/session/${sessionId}/status`);
    }
}

export default new UploadApi();
