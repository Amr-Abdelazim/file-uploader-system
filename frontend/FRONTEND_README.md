# File Uploader Frontend (Polished React + Vite)

A modern, feature-rich file management web application built with React, Vite, and Material-UI.

## Features

✅ **User Authentication**
- User signup and login
- Secure token-based authentication with refresh token support
- Session persistence

✅ **Folder Management**
- Create, rename, and delete folders
- Navigate folder hierarchy with breadcrumb navigation
- Real-time folder content preview

✅ **File Management**
- Upload files with chunked upload mechanism (1MB chunks)
- Download files with streaming support
- Rename and delete files
- View file metadata (size, date, type)

✅ **Upload Features**
- Resumable chunked uploads with progress tracking
- Session-based upload tracking
- Automatic chunk retry on failure
- Real-time upload progress UI

✅ **Permissions & Sharing**
- Manage object-level permissions (viewer/editor/owner)
- Share folders and files with other users
- Permission revocation interface

✅ **Polished UI**
- Material-UI design system for professional appearance
- Responsive layout (desktop/tablet/mobile)
- Loading spinners and error handling
- Toast notifications for user feedback
- Breadcrumb navigation

## Project Structure

```
frontend/src/
├── api/                      # API client modules
│   ├── client.js            # Central HTTP client with token handling
│   ├── AuthApi.js           # Authentication endpoints
│   ├── FolderApi.js         # Folder CRUD operations
│   ├── FileApi.js           # File CRUD operations
│   ├── UploadApi.js         # Chunked upload endpoints
│   └── PermissionApi.js     # Permission management
├── components/              # Reusable React components
│   ├── ProtectedRoute.jsx   # Route guards for auth
│   ├── LoadingSpinner.jsx   # Loading indicator
│   ├── AlertSnackbar.jsx    # Toast notifications
│   ├── FolderBrowser.jsx    # File/folder list table
│   ├── CreateFolderDialog.jsx
│   ├── UploadDialog.jsx     # Chunked upload UI
│   └── PermissionDialog.jsx # Permission management UI
├── contexts/                # React Context providers
│   ├── AuthContext.js       # Authentication state
│   └── AlertContext.js      # Alert/toast state
├── pages/                   # Page components
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Home.jsx             # Main file browser
├── App.jsx                  # Root component with routing
├── main.jsx                 # Entry point
└── index.css               # Global styles
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- Backend API running on `http://localhost:3000`

### Install Dependencies
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

The dev server automatically proxies `/api` requests to `http://localhost:3000` (see `vite.config.js`).

### Build for Production
```bash
npm run build
npm run preview
```

## API Integration

All API calls go through the centralized `api/client.js` which:
- Automatically attaches access tokens from `AuthApi`
- Handles 401 errors by attempting token refresh
- Supports both JSON and FormData (for file uploads)
- Returns raw Response objects when needed (for file downloads)

### API Endpoints Consumed

| Feature | Method | Endpoint |
|---------|--------|----------|
| **Auth** | POST | `/api/login`, `/api/signup`, `/api/token`, `/api/logout` |
| **Folders** | GET/POST/PUT/DELETE | `/api/folder/*` |
| **Files** | GET/PUT/DELETE | `/api/file/*` |
| **Upload** | POST | `/api/upload/session`, `/api/upload/chunk`, `/api/upload/finalize` |
| **Preview** | GET | `/api/preview/folder/:id` |
| **Permissions** | GET/POST/DELETE | `/api/permission/*` |

## Key Components

### AuthContext
Manages user authentication state, login/signup/logout, and token persistence.

### FolderBrowser
Displays folders and files in a table with inline actions (rename, delete, download, share).

### UploadDialog
Implements chunked file upload with:
- 1MB chunk size
- Session-based tracking
- Progress percentage display
- Automatic finalization after all chunks uploaded

### PermissionDialog
Allows users to:
- View current permissions on a file/folder
- Grant new permissions (viewer/editor roles)
- Revoke existing permissions

## Features by Page

### Login / Signup
- Form validation
- Error handling with toast alerts
- Automatic redirect to home on success

### Home (Main App)
- Breadcrumb folder navigation
- Action buttons: "New Folder", "Upload File"
- File/folder browser table with full CRUD operations
- Logout button with user display

## UI Theme

Built with Material-UI's default theme:
- Primary color: Blue (#1976d2)
- Success color: Green (#4caf50)
- Clean, minimal design
- Full responsiveness

## Error Handling

- API errors show toast notifications
- Network errors are caught and displayed
- Form validation prevents invalid submissions
- Protected routes redirect unauthenticated users to login

## Token Refresh Flow

1. Request is made with stored access token
2. If 401 response, automatically attempt token refresh via `/api/token`
3. If refresh succeeds, retry original request with new token
4. If refresh fails, user is returned to login

## Notes

- Folder deletion only works on empty folders (backend validation)
- Upload sessions are created per file and tracked by backend
- Chunked upload automatically merges on finalization
- Permissions are scoped to object (file/folder) and role-based
- All timestamps are in ISO format from backend

## Troubleshooting

**Backend connection fails:**
- Ensure backend is running on `http://localhost:3000`
- Check vite proxy config in `vite.config.js`

**Uploads fail:**
- Check file size and available storage
- Ensure folder has write permissions
- Check browser console for detailed error messages

**Auth issues:**
- Clear browser cookies and localStorage
- Ensure refresh token endpoint works: `POST /api/token`
- Check that credentials are included in cookie requests

## Future Enhancements

- Drag-and-drop file upload
- File preview/inline viewer
- Batch operations (multi-select delete/move)
- Search functionality
- Favorites/starred items
- Recent files view
- Storage usage indicator
- Permission levels (admin, moderator, etc.)
