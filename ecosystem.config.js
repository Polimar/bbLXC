module.exports = {
    apps: [
        {
            name: 'brainbrawler-backend',
            cwd: '/home/backend',
            script: 'npm',
            args: 'run dev',
            env: {
                NODE_ENV: 'development',
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            error_file: '/home/logs/backend-error.log',
            out_file: '/home/logs/backend-out.log',
            log_file: '/home/logs/backend-combined.log',
            time: true,
        },
        {
            name: 'brainbrawler-frontend',
            cwd: '/home/frontend',
            script: 'npm',
            args: 'run dev -- --host',
            env: {
                NODE_ENV: 'development',
            },
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            error_file: '/home/logs/frontend-error.log',
            out_file: '/home/logs/frontend-out.log',
            log_file: '/home/logs/frontend-combined.log',
            time: true,
        },
    ],
};
