import AuthApi from "./AuthApi";
class TransfereApi {
    constructor() {

    }
    async upload(rootFolder, formData) {
        const accessToken = await AuthApi.getAccessToken();
        const res = await fetch(
            "/api/upload/" + rootFolder,
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
                body: formData,
            }
        );
        return await res.text();
    }
}
export default new TransfereApi();