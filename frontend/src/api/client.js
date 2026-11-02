import AuthApi from './AuthApi';

const DEFAULT_JSON_HEADERS = {
    'Content-Type': 'application/json'
};

async function request(path, { method = 'GET', headers = {}, body, signal, raw = false } = {}) {
    const opts = { method, headers: { ...headers } };

    if (body && !(body instanceof FormData)) {
        opts.body = JSON.stringify(body);
        opts.headers = { ...opts.headers, ...DEFAULT_JSON_HEADERS };
    } else if (body instanceof FormData) {
        opts.body = body;
    }

    if (signal) opts.signal = signal;

    const accessToken = await AuthApi.getAccessToken();
    if (accessToken) {
        opts.headers = { ...opts.headers, Authorization: 'Bearer ' + accessToken };
    }

    const res = await fetch(path, opts);

    if (res.status === 401) {
        const refreshed = await AuthApi.refreshAccessToken();
        if (refreshed && refreshed.access_token) {
            opts.headers = { ...opts.headers, Authorization: 'Bearer ' + refreshed.access_token };
            const retry = await fetch(path, opts);
            if (raw) return retry;
            return await retry.json();
        }
        return raw ? res : await res.json();
    }

    if (raw) return res;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await res.json();
    }
    return await res.text();
}

export default { request };
