import AuthApi from "../apiController/AuthApi"
import { useAlert } from "../contexts/AlertContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth/AuthContext";
export function LogoutButton() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const { setAccessToken } = useAuth();
    async function logout() {
        const res = await AuthApi.logout();
        if (res.error) showAlert(res.error, 'error')
        else {
            showAlert(res.message, 'success');
            setAccessToken(null);
            navigate('/login');
        }
    }

    return (
        <>
            <button onClick={logout}>Logout</button>
        </>

    )
}