import client from '../api/client';

class FolderApi {
    constructor() {
        this.root = null;
    }

    async getRoot() {
        if (this.root) return this.root;
        const res = await client.request('/api/folder/root');
        if (!res || !res.id) return null;
        this.root = res.id;
        return res.id;
    }

    async getFolderPreview(folderId) {
        if (!folderId) return null;
        return await client.request(`/api/preview/folder/${folderId}`);
    }

    async checkFolder(folderId) {
        const res = await client.request(`/api/folder/check/${folderId}`, { method: 'GET', raw: true });
        return res.status === 200;
    }

    async getFolderPath(folderId, maxPathLength = 5) {
        const res = await client.request(`/api/folder/path/${folderId}?pathLength=${maxPathLength}`);
        if (!res) return [];
        return res.reverse();
    }
}

export default new FolderApi();