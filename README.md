# Evolution Lab

Complete WhatsApp Platform Integration - Evolution API + Flowcore AI

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm run install:evolution
npm run install:flowcore

# Build both services
npm run build

# Start all services
npm start
```

### Railway Deployment

1. **Push to GitHub:**
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Deploy on Railway:**
- Create new project
- Connect GitHub repo
- Add environment variables (see `.env.example`)
- Deploy!

## 📦 What's Included

- **Evolution API** (Port 8080) - WhatsApp backend
- **Flowcore AI** (Port 3000) - Platform API
- **Manager UI** - WhatsApp management interface
- **Platform API** - 8 endpoints for integration

## 🔗 Endpoints

After deployment, access:
- Manager UI: `https://your-app.railway.app:3000/manager`
- Platform API: `https://your-app.railway.app:3000/api/whatsapp/*`
- Health Check: `https://your-app.railway.app:3000/health`

## 📚 Documentation

See `/brain/` directory for complete guides:
- Platform Integration Guide
- API Reference
- Deployment Guide
- Testing Guide

## 🛠️ Tech Stack

- Node.js 18+
- TypeScript
- Express
- Supabase (PostgreSQL + Storage)
- Evolution API (WhatsApp)

## 📄 License

ISC
