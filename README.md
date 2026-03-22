# MS CV Pro

A lightweight, self-hostable **ATS-optimised CV builder** with a live preview editor, keyword analysis engine, and PDF export — all running on your own infrastructure. No SaaS fees. No data leaving your server.

```
┌─────────────────────────────────────────┐
│  React SPA (Editor · Preview · ATS)     │
└──────────────────┬──────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────┐
│         Nginx (reverse proxy)           │
└──────────┬───────────────┬──────────────┘
           │ REST          │ static
┌──────────▼─────┐  ┌──────▼──────────────┐
│ Express + ORM  │  │  Frontend (built)    │
│ ATS Engine     │  └─────────────────────┘
│ Puppeteer PDF  │
└──────────┬─────┘
┌──────────▼─────┐
│  PostgreSQL 15  │
└────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| **CV Editor** | Section-based editor: Personal info, Work, Education, Skills, Projects, Certifications |
| **Live Preview** | Real-time A4 preview as you type |
| **ATS Scoring** | Local keyword analysis engine — no API keys needed |
| **PDF Export** | Clean, ATS-safe PDF via Puppeteer headless Chrome |
| **Multi-CV** | Unlimited CVs per user, with duplicate support |
| **Auth** | JWT-based auth with bcrypt password hashing |
| **Self-hosted** | Single `docker compose up` deployment |

---

## Quick Start

### Prerequisites
- Docker ≥ 24 and Docker Compose ≥ 2.24
- 1 GB RAM minimum (Puppeteer needs ~300 MB for Chrome)

### 1. Clone and configure

```bash
git clone https://github.com/yourname/mscvpro.git
cd mscvpro

cp .env.example .env
# Edit .env — at minimum set DB_PASSWORD and JWT_SECRET
```

### 2. Start the stack

```bash
docker compose up -d --build
```

First boot takes 3-5 minutes (npm install + Chrome download + DB migration).

### 3. Check it's running

```bash
docker compose ps
curl http://localhost/api/health
```

### 4. (Optional) Load demo data

```bash
docker compose exec api npm run db:seed
# Demo login: demo@mscvpro.local / demo1234
```

Open **http://localhost** — you're ready.

---

## Development (local, no Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 15 running locally

### Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL in .env

npm install
npx prisma migrate dev
npm run db:seed    # optional demo data
npm run dev
# API running at http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Production Deployment

### HTTPS with Let's Encrypt (recommended)

1. Point your domain to the server IP
2. Get certificates:
   ```bash
   apt install certbot
   certbot certonly --standalone -d yourdomain.com
   ```
3. Copy certs to `nginx/ssl/`:
   ```bash
   cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   ```
4. Uncomment the HTTPS server block in `nginx/nginx.conf`
5. Update `.env`: `CORS_ORIGIN=https://yourdomain.com`
6. `docker compose up -d --build`

### Updating

```bash
git pull
docker compose up -d --build
```

Prisma migrations run automatically on container start.

---

## Architecture

```
mscvpro/
├── backend/
│   ├── src/
│   │   ├── index.js            # Express app entry
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.js         # Register / login / me
│   │   │   ├── cv.js           # Full CV CRUD + sections
│   │   │   ├── ats.js          # ATS scoring endpoint
│   │   │   ├── export.js       # PDF + HTML preview
│   │   │   └── upload.js       # Profile photo upload
│   │   └── services/
│   │       ├── atsEngine.js    # Local TF-IDF keyword engine
│   │       └── pdfExport.js    # Puppeteer HTML→PDF
│   └── prisma/
│       ├── schema.prisma
│       ├── seed.js
│       └── migrations/
├── frontend/
│   └── src/
│       ├── pages/              # Login, Register, Dashboard, Editor
│       ├── components/
│       │   ├── editor/         # All form sections
│       │   ├── preview/        # Live CV renderer
│       │   └── ats/            # ATS score panel
│       └── store/              # Zustand (auth + CV state)
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
```

### ATS Engine

The scoring engine (`backend/src/services/atsEngine.js`) runs entirely locally:

1. **Keyword extraction** — tokenises the job description using TF-IDF-inspired frequency weighting, extracting unigrams and bigrams after stop-word removal
2. **Keyword matching** — checks which JD keywords appear in the CV text
3. **Section scoring** — checks for presence of key sections (summary, quantified achievements, dates, contact info)
4. **Format scoring** — flags ATS red flags (missing email/phone, too-sparse content, undated experience)
5. **Scoring** — weighted composite: keywords 45%, sections 35%, format 20%

No external API calls are made during scoring.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | `mscvpro_secret` | PostgreSQL password |
| `JWT_SECRET` | `change-me` | JWT signing secret — **must change in production** |
| `NODE_ENV` | `production` | Node environment |
| `CORS_ORIGIN` | `http://localhost` | Allowed CORS origin |
| `HTTP_PORT` | `80` | Host HTTP port |
| `HTTPS_PORT` | `443` | Host HTTPS port |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, React Router |
| Backend | Node.js 20, Express 4, Prisma ORM |
| Database | PostgreSQL 15 |
| PDF | Puppeteer (headless Chrome) |
| ATS Engine | Custom TF-IDF (no external APIs) |
| Proxy | Nginx |
| Container | Docker Compose |

---

## License

MIT
