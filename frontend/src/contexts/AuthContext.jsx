import { createContext, useContext, useState, useEffect } from 'react';
import AuthApi from '../api/AuthApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        // Check if user is logged in on mount
        const initAuth = async () => {
            const accessToken = await AuthApi.getAccessToken();
            if (accessToken) {
                setToken(accessToken);
                // We could fetch user info here if needed
                setUser({ token: accessToken });
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        const res = await AuthApi.login({ username, password });
        if (res.success) {
            setUser({ username });
            setToken(res.access_token);
            return { success: true };
        }
        return res;
    };

    const signup = async (username, email, password, confirmPassword) => {
        const res = await AuthApi.signup({ username, email, password, confirmPassword });
        if (res.success) {
            setUser({ username, email });
            setToken(res.access_token);
            return { success: true };
        }
        return res;
    };

    const logout = async () => {
        await AuthApi.logout();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
