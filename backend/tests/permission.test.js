import { test } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/utils/prisma.js';
import userService from '../src/services/userService.js';
import permissionService from '../src/services/permissionService.js';

const originalPrisma = {
    user: { findUnique: prisma.user.findUnique },
    file: { findUnique: prisma.file.findUnique },
    folder: { findUnique: prisma.folder.findUnique },
    permission: {
        findUnique: prisma.permission.findUnique,
        findMany: prisma.permission.findMany,
        upsert: prisma.permission.upsert,
        deleteMany: prisma.permission.deleteMany
    }
};

function restoreMocks() {
    prisma.user.findUnique = originalPrisma.user.findUnique;
    prisma.file.findUnique = originalPrisma.file.findUnique;
    prisma.folder.findUnique = originalPrisma.folder.findUnique;
    prisma.permission.findUnique = originalPrisma.permission.findUnique;
    prisma.permission.findMany = originalPrisma.permission.findMany;
    prisma.permission.upsert = originalPrisma.permission.upsert;
    prisma.permission.deleteMany = originalPrisma.permission.deleteMany;
}

test.afterEach(() => {
    restoreMocks();
});

function createPrismaState() {
    return {
        users: [
            { id: 'owner-1', email: 'owner@example.com' },
            { id: 'editor-1', email: 'editor@example.com' }
        ],
        folders: [
            { id: 'folder-1', ownerId: 'owner-1', visibility: 'private', parentId: null }
        ],
        files: [
            { id: 'file-1', ownerId: 'owner-1', visibility: 'private', folderId: 'folder-1' }
        ],
        permissions: [
            { id: 'perm-1', userId: 'editor-1', objectId: 'folder-1', objectType: 'folder', role: 'editor', createdAt: new Date() }
        ]
    };
}

function installPrismaMocks(state) {
    prisma.user.findUnique = async ({ where, select }) => {
        return state.users.find(user => user.email === where.email) || null;
    };

    prisma.file.findUnique = async ({ where, select }) => {
        const file = state.files.find(item => item.id === where.id);
        if (!file) return null;
        return select ? Object.fromEntries(Object.entries(file).filter(([key]) => select[key])) : { ...file };
    };

    prisma.folder.findUnique = async ({ where, select }) => {
        const folder = state.folders.find(item => item.id === where.id);
        if (!folder) return null;
        return select ? Object.fromEntries(Object.entries(folder).filter(([key]) => select[key])) : { ...folder };
    };

    prisma.permission.findUnique = async ({ where, select }) => {
        const permission = state.permissions.find(item =>
            item.userId === where.userId_objectId_objectType.userId &&
            item.objectId === where.userId_objectId_objectType.objectId &&
            item.objectType === where.userId_objectId_objectType.objectType
        );
        if (!permission) return null;
        return select ? Object.fromEntries(Object.entries(permission).filter(([key]) => select[key])) : { ...permission };
    };

    prisma.permission.findMany = async ({ where, select }) => {
        const permissions = state.permissions.filter(item =>
            item.objectId === where.objectId && item.objectType === where.objectType
        );
        return permissions.map(permission => select ? Object.fromEntries(Object.entries(permission).filter(([key]) => select[key])) : { ...permission });
    };

    prisma.permission.upsert = async ({ where, create, update, select }) => {
        let permission = state.permissions.find(item =>
            item.userId === where.userId_objectId_objectType.userId &&
            item.objectId === where.userId_objectId_objectType.objectId &&
            item.objectType === where.userId_objectId_objectType.objectType
        );

        if (permission) {
            permission = Object.assign(permission, update);
        } else {
            permission = { id: `perm-${state.permissions.length + 1}`, createdAt: new Date(), ...create };
            state.permissions.push(permission);
        }

        return select ? Object.fromEntries(Object.entries(permission).filter(([key]) => select[key])) : { ...permission };
    };

    prisma.permission.deleteMany = async ({ where }) => {
        const originalLength = state.permissions.length;
        state.permissions = state.permissions.filter(item =>
            !(item.userId === where.userId && item.objectId === where.objectId && item.objectType === where.objectType)
        );
        return { count: originalLength - state.permissions.length };
    };
}

test('hasAccess returns true for owner of a file', async () => {
    const state = createPrismaState();
    installPrismaMocks(state);

    const access = await userService.hasAccess('owner-1', 'file-1', 'file', 'viewer');
    assert.equal(access, true);
});

test('hasAccess returns true for editor permission inherited from parent folder', async () => {
    const state = createPrismaState();
    installPrismaMocks(state);

    const access = await userService.hasAccess('editor-1', 'file-1', 'file', 'editor');
    assert.equal(access, true);
});

test('createOrUpdatePermission can grant permission using target email', async () => {
    const state = createPrismaState();
    installPrismaMocks(state);

    const permission = await permissionService.createOrUpdatePermission({
        objectType: 'file',
        objectId: 'file-1',
        targetUserEmail: 'editor@example.com',
        role: 'viewer'
    });

    assert.equal(permission.objectId, 'file-1');
    assert.equal(permission.objectType, 'file');
    assert.equal(permission.role, 'viewer');
});

test('revokePermission removes an existing permission row', async () => {
    const state = createPrismaState();
    installPrismaMocks(state);

    const removed = await permissionService.revokePermission({
        objectType: 'folder',
        objectId: 'folder-1',
        targetUserId: 'editor-1'
    });

    assert.equal(removed, true);
    assert.equal(state.permissions.length, 0);
});
