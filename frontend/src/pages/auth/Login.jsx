import { useAuth } from "../../contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../apiController/AuthApi";
import { useState } from "react";
export function Login() {
    const { setAccessToken } = useAuth();
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    async function login(formData) {
        const res = await AuthApi.login({
            username: formData.get("username"),
            password: formData.get("password")
        });
        if (!res.error) {
            setAccessToken(res.access_token);
            navigate("/", { replace: true });
        } else {
            setMessage(res.error);
        }
    }

    return (
        <>
            <div className="main-container">
                <form action={login}>
                    <input type="text" name="username" placeholder="Enter username" />
                    <input type="password" name="password" />
                    <button type="submit">Login</button>
                </form>
                {message ? <p>{message}</p> : ""}
            </div>

        </>
    )
}