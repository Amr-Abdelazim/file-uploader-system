import { Snackbar, Alert } from '@mui/material';
import { useAlert } from '../contexts/AlertContext.jsx';

export function AlertSnackbar() {
    const { alerts, removeAlert } = useAlert();

    return (
        <>
            {alerts.map((alert, idx) => (
                <Snackbar
                    key={alert.id}
                    open={true}
                    autoHideDuration={3000}
                    onClose={() => removeAlert(alert.id)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    sx={{ bottom: `${idx * 80 + 20}px` }}
                >
                    <Alert
                        onClose={() => removeAlert(alert.id)}
                        severity={alert.type}
                        sx={{ width: '100%' }}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            ))}
        </>
    );
}
