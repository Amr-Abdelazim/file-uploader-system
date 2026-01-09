import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import AuthApi from "../../apiController/AuthApi";
export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(undefined);
    useEffect(() => {
        async function initAuth() {
            const token = await AuthApi.getAccessToken();
            setAccessToken(token ?? null);
        }
        initAuth();
    }, []);
    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider >
    );
}
