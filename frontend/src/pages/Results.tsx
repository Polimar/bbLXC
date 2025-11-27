import { Box, Typography, Card, CardContent, Button, Avatar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Player {
    id: string;
    username: string;
    score: number;
}

interface ResultsProps {
    players: Player[];
    onPlayAgain: () => void;
}

export const Results = ({ players, onPlayAgain }: ResultsProps) => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
            >
                <Card sx={{ textAlign: 'center', p: 4, mb: 4, background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,105,67,0.1) 100%)' }}>
                    <EmojiEventsIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 900, color: '#FFD700' }}>
                        Winner!
                    </Typography>
                    <Avatar
                        sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}
                    >
                        {winner?.username[0]}
                    </Avatar>
                    <Typography variant="h4" gutterBottom>
                        {winner?.username}
                    </Typography>
                    <Typography variant="h5" color="primary">
                        {winner?.score} pts
                    </Typography>
                </Card>

                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                            Leaderboard
                        </Typography>
                        <List>
                            {sortedPlayers.map((player, index) => (
                                <ListItem key={player.id} divider={index !== sortedPlayers.length - 1}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'action.disabled' }}>
                                            {index + 1}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={player.username}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                    <ListItemSecondaryAction>
                                        <Typography variant="h6" fontWeight="bold">
                                            {player.score}
                                        </Typography>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 3 }}
                            onClick={onPlayAgain}
                        >
                            Play Again
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </Box>
    );
};
