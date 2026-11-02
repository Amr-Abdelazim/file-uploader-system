import client from '../api/client';

class FileApi {
    constructor() { }

    async downloadFile(fileId) {
        // return raw response for streaming/blobs
        return await client.request(`/api/file/download/${fileId}`, { method: 'GET', raw: true });
    }
}

export default new FileApi();