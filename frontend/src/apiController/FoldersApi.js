import AuthApi from "./AuthApi";
class FolderApi {
    constructor() {
        this.root = null;
    }
    async getRoot() {
        if (this.root) return this.root;
        const access_token = await AuthApi.getAccessToken();
        const res = await fetch('/api/folder/root', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: "Bearer " + access_token,
            }
        }).then(async (res) => await res.json());
        console.log(res);
        if (!res.id) return null;
        this.root = res.id;
        return res.id;
    }
    async getFolderPreview(folderId) {
        const access_token = await AuthApi.getAccessToken();
        const res = await fetch('/api/preview/folder/' + folderId, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token
            }

        }).then(async (res) => res.json());

        return res;
    }
    async checkFolder(folderId) {
        const access_token = await AuthApi.getAccessToken();
        const res = await fetch('/api/folder/check/' + folderId, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token
            }

        });
        if (res.status != 200) return false;
        return true;
    }
    async getFolderPath(folderId, maxPathLength = 5) {
        const access_token = await AuthApi.getAccessToken();
        const res = await fetch(`/api/folder/path/${folderId}?pathLength=${maxPathLength}`, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        }).then(async (res) => await res.json());

        return res.reverse();
    }
}
export default new FolderApi();