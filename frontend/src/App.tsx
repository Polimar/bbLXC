import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { GameInterface } from './pages/GameInterface';
import { UnifiedDashboard } from './pages/UnifiedDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

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
                                <UnifiedDashboard />
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
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
