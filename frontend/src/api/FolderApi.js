import client from './client';

class FolderApi {
    async createFolder(parentId, name) {
        return client.request('/api/folder', {
            method: 'POST',
            body: { parentId, name }
        });
    }

    async getRoot() {
        return client.request('/api/folder/root');
    }

    async getFolder(folderId) {
        return client.request(`/api/folder/${folderId}`);
    }

    async updateFolder(folderId, name) {
        return client.request(`/api/folder/${folderId}`, {
            method: 'PUT',
            body: { name }
        });
    }

    async deleteFolder(folderId) {
        return client.request(`/api/folder/${folderId}`, {
            method: 'DELETE',
            raw: true
        });
    }

    async getFolderPath(folderId, maxPathLength = 5) {
        const res = await client.request(`/api/folder/path/${folderId}?pathLength=${maxPathLength}`);
        return res || [];
    }

    async getFolderPreview(folderId) {
        return client.request(`/api/preview/folder/${folderId}`);
    }

    async checkFolder(folderId) {
        const res = await client.request(`/api/folder/check/${folderId}`, { method: 'GET', raw: true });
        return res.status === 200;
    }
}

export default new FolderApi();
