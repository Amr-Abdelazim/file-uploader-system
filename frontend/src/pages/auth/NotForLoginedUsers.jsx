import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/auth/AuthContext";
import { FullPageSpinner } from '../../components/FullPageSpinner';
export function NotForLoginedUsers() {
    const { accessToken } = useAuth();
    if (accessToken === undefined) {
        return <FullPageSpinner />;
    }
    if (accessToken !== null) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
