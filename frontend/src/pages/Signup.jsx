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

export function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await signup(username, email, password, confirmPassword);
            if (res.success) {
                showAlert('Signup successful! Redirecting...', 'success');
                navigate('/');
            } else {
                showAlert(res.error || 'Signup failed', 'error');
            }
        } catch (err) {
            showAlert(err.message || 'Signup error', 'error');
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
                    Create Account
                </Typography>

                <form onSubmit={handleSignup}>
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
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <Link href="/login" sx={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
