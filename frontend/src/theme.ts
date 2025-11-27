import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#D946EF', // Neon Pink/Purple
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#8B5CF6', // Violet
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#1A0B2E', // Deep Purple
            paper: 'rgba(30, 15, 50, 0.7)', // Semi-transparent dark purple
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#E9D5FF', // Light purple text
        },
        error: {
            main: '#FF4365',
        },
        warning: {
            main: '#FFB238',
        },
        info: {
            main: '#00D4FF',
        },
        success: {
            main: '#00FF94',
        },
    },
    typography: {
        fontFamily: '"Outfit", "Inter", sans-serif',
        h1: {
            fontWeight: 800,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 700,
        },
        button: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
        },
    },
    shape: {
        borderRadius: 24,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    padding: '12px 28px',
                    boxShadow: '0 0 15px rgba(217, 70, 239, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 0 25px rgba(217, 70, 239, 0.6)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #D946EF 0%, #8B5CF6 100%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                },
                outlined: {
                    borderWidth: '2px',
                    '&:hover': {
                        borderWidth: '2px',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 32,
                    background: 'rgba(30, 15, 50, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 600,
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: '#1A0B2E',
                    minHeight: '100vh',
                    overflowX: 'hidden',
                },
            },
        },
    },
});
