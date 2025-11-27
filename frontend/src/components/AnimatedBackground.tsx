import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export const AnimatedBackground = () => {
    const blobs = [
        {
            color: '#D946EF',
            size: 500,
            x: '10%',
            y: '20%',
            duration: 25,
            path: 'M45,-78C58,-70,68,-56,73,-40C78,-24,78,-6,75,11C72,28,66,44,56,56C46,68,32,76,17,78C2,80,-14,76,-28,69C-42,62,-54,52,-63,39C-72,26,-78,10,-77,-7C-76,-24,-68,-42,-57,-53C-46,-64,-32,-68,-17,-72C-2,-76,15,-80,30,-78C45,-76,32,-86,45,-78Z',
            viewBox: '0 0 200 200'
        },
        {
            color: '#8B5CF6',
            size: 600,
            x: '75%',
            y: '10%',
            duration: 30,
            path: 'M43,-76C55,-66,64,-53,70,-38C76,-23,79,-6,78,11C77,28,72,45,62,58C52,71,37,80,21,83C5,86,-12,83,-27,76C-42,69,-55,58,-64,44C-73,30,-78,13,-77,-5C-76,-23,-69,-42,-59,-55C-49,-68,-36,-75,-22,-77C-8,-79,9,-76,26,-70C43,-64,31,-86,43,-76Z',
            viewBox: '0 0 200 200'
        },
        {
            color: '#6366F1',
            size: 450,
            x: '50%',
            y: '75%',
            duration: 28,
            path: 'M39,-70C50,-60,58,-48,63,-35C68,-22,70,-8,69,7C68,22,64,38,56,51C48,64,36,74,22,78C8,82,-8,80,-23,74C-38,68,-52,58,-62,45C-72,32,-78,16,-77,0C-76,-16,-68,-32,-58,-45C-48,-58,-36,-68,-23,-72C-10,-76,5,-74,20,-68C35,-62,28,-80,39,-70Z',
            viewBox: '0 0 200 200'
        },
        {
            color: '#EC4899',
            size: 400,
            x: '20%',
            y: '85%',
            duration: 22,
            path: 'M47,-81C60,-72,69,-58,74,-43C79,-28,80,-12,77,4C74,20,67,36,57,49C47,62,34,72,19,76C4,80,-13,78,-28,72C-43,66,-56,56,-65,43C-74,30,-79,14,-78,-3C-77,-20,-70,-38,-59,-51C-48,-64,-33,-72,-17,-75C-1,-78,17,-76,33,-70C49,-64,34,-90,47,-81Z',
            viewBox: '0 0 200 200'
        },
        {
            color: '#A855F7',
            size: 550,
            x: '85%',
            y: '60%',
            duration: 35,
            path: 'M41,-73C53,-64,62,-52,68,-38C74,-24,77,-8,76,8C75,24,70,40,61,53C52,66,39,76,25,79C11,82,-4,78,-19,72C-34,66,-49,58,-60,46C-71,34,-78,18,-78,1C-78,-16,-71,-34,-61,-48C-51,-62,-38,-72,-24,-75C-10,-78,6,-74,21,-68C36,-62,29,-82,41,-73Z',
            viewBox: '0 0 200 200'
        },
        {
            color: '#F472B6',
            size: 350,
            x: '40%',
            y: '40%',
            duration: 26,
            path: 'M38,-66C48,-56,55,-44,59,-31C63,-18,64,-4,62,10C60,24,55,38,47,50C39,62,28,72,15,75C2,78,-13,74,-27,67C-41,60,-54,50,-63,37C-72,24,-77,8,-76,-8C-75,-24,-68,-40,-58,-52C-48,-64,-35,-72,-21,-74C-7,-76,9,-72,24,-65C39,-58,28,-76,38,-66Z',
            viewBox: '0 0 200 200'
        },
    ];

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1A0B2E 0%, #16213E 50%, #0F3460 100%)',
            }}
        >
            {/* Gooey Effect Filter */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    filter: 'url(#goo)',
                    opacity: 0.8,
                }}
            >
                {blobs.map((blob, i) => (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: blob.size,
                            height: blob.size,
                            left: blob.x,
                            top: blob.y,
                        }}
                        animate={{
                            x: [0, 150, -100, 50, 0],
                            y: [0, -120, 80, -50, 0],
                            rotate: [0, 90, 180, 270, 360],
                            scale: [1, 1.3, 0.9, 1.1, 1],
                        }}
                        transition={{
                            duration: blob.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            times: [0, 0.25, 0.5, 0.75, 1],
                        }}
                    >
                        <svg
                            viewBox={blob.viewBox}
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                width: '100%',
                                height: '100%',
                                filter: 'blur(50px)',
                            }}
                        >
                            <motion.path
                                d={blob.path}
                                fill={blob.color}
                                transform="translate(100 100)"
                                animate={{
                                    d: [
                                        blob.path,
                                        blob.path.replace(/M\d+,-\d+/, 'M50,-85'),
                                        blob.path,
                                    ],
                                }}
                                transition={{
                                    duration: blob.duration / 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </svg>
                    </motion.div>
                ))}
            </Box>

            {/* Overlay gradient for better text readability */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(26, 11, 46, 0.5) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </Box>
    );
};
