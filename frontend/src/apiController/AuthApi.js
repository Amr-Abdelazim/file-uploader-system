
class AuthApi {
    constructor() {
        this.access_token = null;
    }
    async getAccessToken() {
        if (this.access_token) return this.access_token;
        const res = await this.refreshAccessToken();
        if (res.error) return null;
        this.access_token = res.access_token;
        return res.access_token;
    }
    async login(payload) {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(async (res) => await res.json());
        if (res.access_token) {
            this.access_token = res.access_token;
            return { access_token: res.access_token };
        }
        return res;
    }

    async refreshAccessToken() {
        const res = await fetch('/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(async (res) => await res.json());
        if (res.access_token) return { access_token: res.access_token };
        return res;
    }
    async signup(payload) { /* payload = {username,email,password,confirmPassword} */
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(async (res) => await res.json());
        return res;
    }
    async logout() {
        const res = await fetch('/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(async (res) => await res.json());
        this.access_token = null;
        return res;
    }

}




export default new AuthApi();