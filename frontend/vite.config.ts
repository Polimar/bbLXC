import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        host: true, // Listen on all network interfaces
        allowedHosts: [
            'brainbrawler.dyns.cx',
            'localhost',
            '127.0.0.1'
        ],
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:3000',
                ws: true,
            }
        }
    }
})
