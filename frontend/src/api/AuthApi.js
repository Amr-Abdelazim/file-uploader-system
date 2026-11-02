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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        }).then(r => r.json());

        if (res.access_token) {
            this.access_token = res.access_token;
            return { success: true, access_token: res.access_token };
        }
        return res;
    }

    async signup(payload) {
        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        }).then(r => r.json());

        if (res.access_token) {
            this.access_token = res.access_token;
            return { success: true, access_token: res.access_token };
        }
        return res;
    }

    async refreshAccessToken() {
        const res = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        }).then(r => r.json());

        if (res.access_token) {
            this.access_token = res.access_token;
            return { success: true, access_token: res.access_token };
        }
        return res;
    }

    async logout() {
        this.access_token = null;
        return await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        }).then(r => r.json());
    }

    setAccessToken(token) {
        this.access_token = token;
    }

    clearAccessToken() {
        this.access_token = null;
    }
}

export default new AuthApi();
