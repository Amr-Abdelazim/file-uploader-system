import client from './client';

class FileApi {
    async getFileInfo(fileId) {
        return client.request(`/api/file/${fileId}`);
    }

    async downloadFile(fileId) {
        return client.request(`/api/file/download/${fileId}`, { method: 'GET', raw: true });
    }

    async renameFile(fileId, name) {
        return client.request(`/api/file/${fileId}`, {
            method: 'PUT',
            body: { name }
        });
    }

    async deleteFile(fileId) {
        const res = await client.request(`/api/file/${fileId}`, {
            method: 'DELETE',
            raw: true
        });
        return res.status === 200;
    }
}

export default new FileApi();
