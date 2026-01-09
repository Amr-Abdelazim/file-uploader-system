import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { FullPageSpinner } from '../../components/FullPageSpinner';
export function ProtectedRoutes() {
    const { accessToken } = useAuth();
    if (accessToken === undefined) {
        return <FullPageSpinner />;
    }
    if (accessToken === null) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
