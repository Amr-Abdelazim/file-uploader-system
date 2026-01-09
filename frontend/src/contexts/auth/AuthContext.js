import { createContext, useContext } from "react";
const AuthContext = createContext();


function useAuth() {
    return useContext(AuthContext);
}
export { AuthContext, useAuth };