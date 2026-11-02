import client from './client';

class PermissionApi {
    async listPermissions(objectType, objectId) {
        return client.request(`/api/permission/${objectType}/${objectId}`);
    }

    async assignPermission(userId, objectType, objectId, role) {
        return client.request('/api/permission', {
            method: 'POST',
            body: { userId, objectType, objectId, role }
        });
    }

    async revokePermission(userId, objectType, objectId) {
        return client.request('/api/permission', {
            method: 'DELETE',
            body: { userId, objectType, objectId },
            raw: true
        });
    }
}

export default new PermissionApi();
