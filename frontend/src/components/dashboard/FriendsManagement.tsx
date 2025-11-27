import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Box,
    Alert,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

interface Friend {
    id: string;
    username: string;
    email: string;
    isOnline: boolean;
}

interface FriendRequest {
    id: string;
    sender: { id: string; username: string; email: string };
    receiver: { id: string; username: string; email: string };
    status: string;
}

interface FriendsManagementProps {
    token: string;
}

export const FriendsManagement: React.FC<FriendsManagementProps> = ({ token }) => {
    const [tab, setTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [friends, setFriends] = useState<Friend[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchFriends();
        fetchFriendRequests();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFriends(data);
            }
        } catch (err) {
            console.error('Failed to fetch friends:', err);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const res = await fetch('/api/friends/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFriendRequests(data);
            }
        } catch (err) {
            console.error('Failed to fetch friend requests:', err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            } else {
                setError('Failed to search users');
            }
        } catch (err) {
            setError('Failed to search users');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        try {
            const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ receiverId: userId })
            });

            if (res.ok) {
                setSuccess('Friend request sent!');
                setSearchResults([]);
                setSearchQuery('');
                setTimeout(() => setSuccess(null), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to send request');
            }
        } catch (err) {
            setError('Failed to send friend request');
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/friends/request/${requestId}/accept`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setSuccess('Friend request accepted!');
                fetchFriends();
                fetchFriendRequests();
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            setError('Failed to accept request');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/friends/request/${requestId}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchFriendRequests();
            }
        } catch (err) {
            setError('Failed to reject request');
        }
    };

    const handleRemoveFriend = async (friendId: string) => {
        try {
            const res = await fetch(`/api/friends/${friendId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchFriends();
            }
        } catch (err) {
            setError('Failed to remove friend');
        }
    };

    return (
        <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
        }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Friends Management</Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <Tab label={`Friends (${friends.length})`} />
                    <Tab label={`Requests (${friendRequests.length})`} />
                    <Tab label="Search" />
                </Tabs>

                {tab === 0 && (
                    <List>
                        {friends.length === 0 ? (
                            <Typography color="text.secondary">No friends yet</Typography>
                        ) : (
                            friends.map((friend) => (
                                <ListItem key={friend.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ListItemText
                                        primary={friend.username}
                                        secondary={
                                            <Chip
                                                label={friend.isOnline ? 'Online' : 'Offline'}
                                                size="small"
                                                color={friend.isOnline ? 'success' : 'default'}
                                                sx={{ mt: 0.5 }}
                                            />
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleRemoveFriend(friend.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        )}
                    </List>
                )}

                {tab === 1 && (
                    <List>
                        {friendRequests.length === 0 ? (
                            <Typography color="text.secondary">No pending requests</Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <ListItem key={request.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ListItemText
                                        primary={request.sender.username}
                                        secondary={request.sender.email}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleAcceptRequest(request.id)} color="success">
                                            <CheckIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleRejectRequest(request.id)} color="error">
                                            <CloseIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        )}
                    </List>
                )}

                {tab === 2 && (
                    <Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by username or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
                            >
                                Search
                            </Button>
                        </Box>

                        <List>
                            {searchResults.map((user) => (
                                <ListItem key={user.id} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ListItemText
                                        primary={user.username}
                                        secondary={user.email}
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleSendRequest(user.id)}
                                            startIcon={<PersonAddIcon />}
                                        >
                                            Add Friend
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
