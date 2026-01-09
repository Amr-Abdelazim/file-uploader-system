import { createContext, useContext } from "react";


const AlertContext = createContext();


const useAlert = () => useContext(AlertContext);

export { AlertContext, useAlert }