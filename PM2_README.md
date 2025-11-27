# BrainBrawler - PM2 Quick Reference

## 🚀 Quick Start

The application is now managed by PM2 and starts automatically on system boot!

### Check Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs
```

### Restart Applications
```bash
pm2 restart all
```

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all running processes |
| `pm2 logs` | View all logs in real-time |
| `pm2 logs brainbrawler-backend` | View backend logs only |
| `pm2 logs brainbrawler-frontend` | View frontend logs only |
| `pm2 restart all` | Restart both applications |
| `pm2 stop all` | Stop both applications |
| `pm2 start ecosystem.config.js` | Start applications from config |
| `pm2 monit` | Real-time monitoring dashboard |
| `pm2 flush` | Clear all logs |

## 🔧 Configuration

The PM2 configuration is stored in [`ecosystem.config.js`](file:///home/ecosystem.config.js)

- **Backend**: Runs on port configured in backend/.env
- **Frontend**: Runs with `--host` flag for network access
- **Logs**: Stored in `/home/logs/` directory

## 📦 Repository

- **GitHub**: https://github.com/Polimar/bbLXC.git
- **Branch**: main

## 🎯 What Changed

You no longer need to manually run:
```bash
cd /home/backend && npm run dev
cd /home/frontend && npm run dev -- --host
```

PM2 handles everything automatically! 🎉

## 🔄 Auto-Restart

- Applications restart automatically on crashes
- Applications start automatically on system boot
- Managed by systemd service: `pm2-root.service`

## 📚 Full Documentation

See [walkthrough.md](file:///root/.gemini/antigravity/brain/0952230d-1ac1-40d7-a1a8-a75d6626d8a9/walkthrough.md) for complete setup details and advanced usage.
