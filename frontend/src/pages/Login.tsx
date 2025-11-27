import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.token, data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card sx={{ maxWidth: 400, width: '100%', mx: 2, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, color: '#D946EF' }}>
                            Welcome Back
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 3 }}
                            />
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                type="submit"
                                sx={{ mb: 2, background: 'linear-gradient(45deg, #D946EF 30%, #8B5CF6 90%)' }}
                            >
                                Login
                            </Button>
                        </form>

                        <Typography align="center" color="text.secondary">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register" color="secondary">
                                Register
                            </Link>
                        </Typography>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};
