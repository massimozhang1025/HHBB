# HHBB Hotel Management System — Deployment Guide

## Architecture

```
┌─────────────────────────────────────────────┐
│             Production Server               │
│                                             │
│  ┌────────────┐    ┌─────────────────────┐  │
│  │ Express.js │    │  Static Frontend    │  │
│  │  API       │◄──►│  (React SPA)        │  │
│  │  /api/*    │    │  /* → index.html    │  │
│  └─────┬──────┘    └─────────────────────┘  │
│        │                                    │
│  ┌─────▼──────┐                             │
│  │ PostgreSQL │                             │
│  │ (SSL)      │                             │
│  └────────────┘                             │
└─────────────────────────────────────────────┘
```

Single server serves both API (`/api/*`) and frontend (`/*`) on one port.

---

## Option A: Deploy to Render.com (Recommended — Free Tier)

### Step 1: Push to GitHub
```bash
cd /Users/io/Desktop/网站/HHBB
git init
git add -A
git commit -m "🚀 HHBB v1.0 - Production ready"
git remote add origin https://github.com/YOUR_USERNAME/hhbb-hotel.git
git push -u origin main
```

### Step 2: One-Click Deploy
1. Go to [render.com/deploy](https://render.com/deploy)
2. Click **New Blueprint Instance**
3. Connect your GitHub repo
4. Render reads `render.yaml` and auto-creates:
   - ✅ Free PostgreSQL database (`hhbb-db`)
   - ✅ Web service with auto-linked `DATABASE_URL`
   - ✅ Auto-generated `JWT_SECRET`

### Step 3: Seed the Database
After the first deploy completes:
```bash
# Connect to Render Shell (from Render Dashboard > Shell tab)
cd server && node seed-db.js
```

### Step 4: Verify
Visit your Render URL:
- `https://hhbb-hotel.onrender.com/` → Homepage
- `https://hhbb-hotel.onrender.com/api/health` → API health check

---

## Option B: Docker Compose (Self-hosted / VPS)

### Step 1: Set Environment
```bash
# Create production env file
cat > .env.production << 'EOF'
DB_PASSWORD=your_strong_password_here
JWT_SECRET=your-random-jwt-secret-minimum-32-chars
CLIENT_URL=https://your-domain.com
EOF
```

### Step 2: Build & Run
```bash
# Build and start all services
docker compose --env-file .env.production up -d --build

# Check logs
docker compose logs -f server

# Seed the database (first time only)
docker exec -it hhbb-server sh -c "cd /app/server && node seed-db.js"
```

### Step 3: Verify
```bash
curl http://localhost:10000/api/health
# {"status":"ok","environment":"production","version":"1.0.0"}
```

---

## Option C: Manual Deployment (Any VPS)

### Prerequisites
- Node.js 20+
- PostgreSQL 16+

### Step 1: Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/hhbb-hotel.git
cd hhbb-hotel

# Install all dependencies and build frontend
cd client && npm ci && npm run build
cd ../server && npm ci --omit=dev
```

### Step 2: Configure
```bash
# Create server/.env
cat > server/.env << 'EOF'
PORT=10000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/hhbb_hotel
JWT_SECRET=your-random-jwt-secret-minimum-32-chars
JWT_EXPIRES_IN=7d
EOF
```

### Step 3: Start with PM2
```bash
npm install -g pm2

# Start the server
pm2 start server/src/app.js --name hhbb-hotel

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | Server port |
| `NODE_ENV` | Yes (prod) | `development` | Set to `production` |
| `DATABASE_URL` | Yes (cloud) | — | Full PostgreSQL connection string |
| `DB_HOST` | Alt | `localhost` | Database host (if no DATABASE_URL) |
| `DB_PORT` | Alt | `5432` | Database port |
| `DB_NAME` | Alt | `hhbb_pms` | Database name |
| `DB_USER` | Alt | `postgres` | Database user |
| `DB_PASSWORD` | Alt | `postgres` | Database password |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token expiry |
| `CLIENT_URL` | No | same-origin | CORS allowed origin |
| `GOOGLE_MAPS_API_KEY` | No | — | Google Maps API key |

---

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@hhbb.com` | `password123` |
| Employee | `marco.rossi@hhbb.com` | `password123` |
| Employee | `giulia.bianchi@hhbb.com` | `password123` |
| Customer | `customer1@example.com` | `password123` |

⚠️ **Change all passwords before going live!**

---

## Maintenance Commands

```bash
# View logs
docker compose logs -f server

# Restart server
docker compose restart server

# Reset database (WARNING: destroys all data)
docker exec -it hhbb-server sh -c "cd /app/server && node seed-db.js"

# Database backup
docker exec hhbb-postgres pg_dump -U hhbb_admin hhbb_hotel > backup.sql

# Database restore
cat backup.sql | docker exec -i hhbb-postgres psql -U hhbb_admin hhbb_hotel
```
