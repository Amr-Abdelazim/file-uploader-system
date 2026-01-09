import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Login } from './pages/auth/Login.jsx';
import { AuthProvider } from './contexts/auth/AuthProvider.jsx';
import { AlertProvider } from './contexts/AlertProvider.jsx';
import { ProtectedRoutes } from './pages/auth/ProtectedRoutes.jsx';
import { Signup } from './pages/auth/Signup.jsx';
import { NotForLoginedUsers } from './pages/auth/NotForLoginedUsers.jsx';
import { FolderPage } from './pages/FolderPage.jsx';
const router = createBrowserRouter([
  {
    element: <NotForLoginedUsers />,
    children: [
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/signup',
        element: <Signup />
      }
    ]
  }
  ,
  {
    element: <ProtectedRoutes />,
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: '/folder/:folderId',
        element: <FolderPage />
      }
    ]
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AlertProvider>
        <RouterProvider router={router} />
      </AlertProvider>
    </AuthProvider>
  </StrictMode>,
)
