import { createContext, useContext, useState } from 'react';

const AlertContext = createContext();

export function AlertProvider({ children }) {
    const [alerts, setAlerts] = useState([]);

    const showAlert = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, type }]);
        if (duration > 0) {
            setTimeout(() => {
                setAlerts(prev => prev.filter(a => a.id !== id));
            }, duration);
        }
        return id;
    };

    const removeAlert = (id) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useAlert must be used inside AlertProvider');
    return ctx;
}
