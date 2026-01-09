import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import { AlertContext } from "./AlertContext";
export function AlertProvider({ children }) {
    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showAlert = (message, severity = "info") => {
        setAlert({ open: true, message, severity });
    };

    const closeAlert = () => {
        setAlert(a => ({ ...a, open: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={closeAlert}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert severity={alert.severity} onClose={closeAlert}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    );
}