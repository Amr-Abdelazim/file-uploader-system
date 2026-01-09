import AuthApi from "./AuthApi";
class FileApi {
    constructor() { }
    async downloadFile(fileId) {
        const access_token = await AuthApi.getAccessToken();
        console.log("hi");
        const res = await fetch('/api/file/download/' + fileId, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + access_token
            }
        });
        return res;
    }
}

export default new FileApi();