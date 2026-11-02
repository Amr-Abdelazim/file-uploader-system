import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LoadingSpinner } from './LoadingSpinner';

export function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (!token) return <Navigate to="/login" replace />;

    return children;
}

export function PublicRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) return <LoadingSpinner />;
    if (token) return <Navigate to="/" replace />;

    return children;
}
