import client from '../api/client';

class TransfereApi {
    constructor() { }

    async upload(rootFolder, formData) {
        const path = rootFolder ? `/api/upload/${rootFolder}` : '/api/upload';
        // Use raw response because upload endpoints may return non-json
        const res = await client.request(path, { method: 'POST', body: formData, raw: true });
        try {
            return await res.text();
        } catch (e) {
            return res;
        }
    }
}

export default new TransfereApi();