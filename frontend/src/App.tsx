import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { GameInterface } from './pages/GameInterface';
import { AdminPanel } from './pages/AdminPanel';
import { PremiumPanel } from './pages/PremiumPanel';
import { FreeDashboard } from './pages/FreeDashboard';
import { PremiumDashboard } from './pages/PremiumDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

const DashboardRouter = () => {
    const { isAdmin, isPremium } = useAuth();

    if (isAdmin) return <AdminDashboard />;
    if (isPremium) return <PremiumDashboard />;
    return <FreeDashboard />;
};

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Dashboard is the new home */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <DashboardRouter />
                            </ProtectedRoute>
                        }
                    />

                    {/* Game Interface */}
                    <Route
                        path="/game/:code"
                        element={
                            <ProtectedRoute>
                                <GameInterface />
                            </ProtectedRoute>
                        }
                    />

                    {/* Legacy route for direct game access (optional) */}
                    <Route
                        path="/play"
                        element={
                            <ProtectedRoute>
                                <GameInterface />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/premium"
                        element={
                            <ProtectedRoute requirePremium>
                                <PremiumPanel />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
