import { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Box,
    Typography,
    Link,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAlert } from '../contexts/AlertContext.jsx';

export function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await login(username, password);
            if (res.success) {
                showAlert('Login successful!', 'success');
                navigate('/');
            } else {
                showAlert(res.error || 'Login failed', 'error');
            }
        } catch (err) {
            showAlert(err.message || 'Login error', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, boxShadow: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                    File Uploader
                </Typography>
                <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: 'gray' }}>
                    Login
                </Typography>

                <form onSubmit={handleLogin}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ mt: 2 }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <Link href="/signup" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Sign up
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
