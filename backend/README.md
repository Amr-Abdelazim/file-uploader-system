# File Uploader Backend

A modern Node.js backend for resumable file uploads, chunked storage, and structured file/folder management.

This backend is implemented with:
- **Express 5** for API routing
- **Prisma** for PostgreSQL database access
- **JWT** for authentication
- **Busboy** for multipart chunk uploads
- **Cookie parser** and validation for secure request handling

## What is implemented so far

### ✅ Core upload workflow
- Start a chunked upload session with `POST /api/upload/session`
- Upload file chunks with `POST /api/upload/chunk`
- Finalize chunk upload and merge into a completed file with `POST /api/upload/finalize`
- Check upload progress with `GET /api/upload/session/:sessionId/status`

### ✅ File download support
- Download completed files with `GET /api/file/download/:fileId`
- Supports HTTP `Range` requests for resumable downloads
- Supports `ETag`/`If-None-Match` caching
- Supports inline preview via `?inline=true` or `?preview=true`

### ✅ Folder and file CRUD
- Create folders with `POST /api/folder`
- Get folder metadata and contents with `GET /api/folder/:folderId`
- Rename folders with `PUT /api/folder/:folderId`
- Delete empty folders with `DELETE /api/folder/:folderId`
- Get file metadata with `GET /api/file/:fileId`
- Rename files with `PUT /api/file/:fileId`
- Delete files with `DELETE /api/file/:fileId`

### ✅ Permissions and sharing
- Assign share roles with `POST /api/permission`
- Revoke share access with `DELETE /api/permission`
- List shared users and roles with `GET /api/permission/:objectType/:objectId`
- Supports `viewer`, `editor`, and `owner` roles for both `file` and `folder`
- Folder permission grants can cascade to files stored inside a shared folder
- Upload session access now requires editor-level access to the target file
- Public files and folders grant viewer access without a permission row

### ✅ Permissions-aware validation
- Folder and file endpoints validate access via `userService`
- Folder creation and upload session start require edit permissions on folders
- File and upload-session access validate ownership or explicit permissions

### ✅ UI-ready integration
- Authentication with `POST /api/signup`, `POST /api/login`, `POST /api/token`, and `POST /api/logout`
- Use `Authorization: Bearer <token>` for all protected routes
- File upload flow: create session → upload chunks → finalize
- File download flow supports `Range` headers and inline preview
- Folder and file metadata routes expose structured data for UI listing
- Permission APIs support sharing by `targetUserId` or `targetUserEmail`

### ✅ Preview endpoint
- Flattened folder preview available at `GET /api/preview/folder/:folderId`

## Project structure

```
backend/
├─ src/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  ├─ services/
│  ├─ utils/
│  └─ index.js
├─ prisma/
├─ docs/
│  └─ backend-api-docs.html
└─ tests/
```

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   - `DATABASE_URL`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`

3. Start the backend:
   ```bash
   npm run dev
   ```

4. Run tests:
   ```bash
   npm test
   ```

## API documentation

A full HTML API reference is available at:
- `docs/backend-api-docs.html`

## Notes on current behavior

- Chunk uploads are stored under `Storage/saved/uploads/<fileId>/`
- Completed files are merged into `Storage/merged/`
- The upload flow is built to support resumable chunk upload and merge safety
- Current permissions are validated, but finer-grained role support is planned next

## What comes next

Future enhancements will include:
- folder/file listing with pagination and search
- richer UI search and filtering support
- retry and cleanup strategies for interrupted uploads
- more integration tests for route-level behavior
- support for `unlisted` visibility and public share links

---

> This README is current for the backend implementation with upload session flow, file/folder CRUD, and permission/share APIs ready for frontend integration.
