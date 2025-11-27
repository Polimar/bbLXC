import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert
} from '@mui/material';

interface User {
    id: string;
    username: string;
    email: string;
    accountType: 'FREE' | 'PREMIUM';
    isAdmin: boolean;
    isOnline: boolean;
    createdAt: string;
}

export const UserManagement: React.FC = () => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<'FREE' | 'PREMIUM'>('FREE');
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data.users || []);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async () => {
        if (!selectedUser) return;

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ accountType: newRole })
            });

            if (res.ok) {
                await fetchUsers();
                setDialogOpen(false);
                setSelectedUser(null);
            } else {
                setError('Failed to update user role');
            }
        } catch (err) {
            setError('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchUsers();
            } else {
                setError('Failed to delete user');
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    if (loading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    {user.username}
                                    {user.isAdmin && <Chip label="ADMIN" size="small" color="error" sx={{ ml: 1 }} />}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.accountType}
                                        color={user.accountType === 'PREMIUM' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.isOnline ? 'Online' : 'Offline'}
                                        color={user.isOnline ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setNewRole(user.accountType);
                                            setDialogOpen(true);
                                        }}
                                        sx={{ mr: 1 }}
                                    >
                                        Edit Role
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Change User Role</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        User: {selectedUser?.username}
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Account Type</InputLabel>
                        <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as 'FREE' | 'PREMIUM')}
                            label="Account Type"
                        >
                            <MenuItem value="FREE">FREE</MenuItem>
                            <MenuItem value="PREMIUM">PREMIUM</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleRoleChange} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
