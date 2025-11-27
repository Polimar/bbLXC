import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color?: string;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = '#FFD700',
    suffix = '',
    prefix = '',
    decimals = 0,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <Card
                sx={{
                    bgcolor: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${color}40`,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                        boxShadow: `0 8px 24px ${color}50`,
                        border: `1px solid ${color}80`
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {title}
                        </Typography>
                        <Box sx={{ color, fontSize: '2rem' }}>
                            {icon}
                        </Box>
                    </Box>
                    <Typography variant="h3" sx={{ color, fontWeight: 'bold' }}>
                        {prefix}
                        {typeof value === 'number' ? (
                            <CountUp
                                end={value}
                                duration={1.5}
                                decimals={decimals}
                                separator=","
                            />
                        ) : (
                            value
                        )}
                        {suffix}
                    </Typography>
                </CardContent>
            </Card>
        </motion.div>
    );
};
