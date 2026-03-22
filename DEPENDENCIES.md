# Dependencies

MS CV Pro is a Node.js monorepo split into two packages — `backend` and `frontend`. There is no Python in this project; dependency management uses `npm` and `package.json` files, not `requirements.txt`.

---

## Backend (`backend/package.json`)

### Runtime dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^5.10.0 | Auto-generated type-safe database client used by all route handlers to read and write PostgreSQL data |
| `bcryptjs` | ^2.4.3 | Password hashing with salt rounds — used during registration and login to store and verify credentials securely |
| `cors` | ^2.8.5 | Express middleware that sets `Access-Control-Allow-Origin` headers so the React frontend can call the API from a different port in development |
| `dotenv` | ^16.4.0 | Loads `.env` file variables into `process.env` at startup — used for `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN` |
| `express` | ^4.18.2 | HTTP server and router framework — all API endpoints (`/api/auth`, `/api/cv`, `/api/ats`, `/api/export`) are built on Express |
| `express-rate-limit` | ^7.2.0 | In-memory rate limiter middleware applied to API routes to prevent brute-force attacks and abuse |
| `express-validator` | ^7.0.1 | Request body validation (email format, password length, required fields) on auth endpoints before data reaches the database |
| `jsonwebtoken` | ^9.0.2 | Signs and verifies JWT tokens used for stateless authentication — tokens expire after 7 days |
| `multer` | ^1.4.5-lts.1 | Multipart form data parser for handling profile photo file uploads, with file size and type validation |
| `natural` | ^6.10.4 | NLP toolkit installed for potential stemming/lemmatisation extensions in the ATS engine — the core engine currently uses custom tokenisation |
| `puppeteer` | ^22.4.0 | Headless Chromium browser used to render CV HTML templates into ATS-safe PDF files via `page.pdf()` |
| `uuid` | ^9.0.0 | Generates unique identifiers for share tokens and exported PDF filenames |

### Dev dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `nodemon` | ^3.1.0 | Watches source files and automatically restarts the Express server on save during local development |
| `prisma` | ^5.10.0 | CLI tool for running migrations (`prisma migrate`), generating the client (`prisma generate`), and launching Prisma Studio |

---

## Frontend (`frontend/package.json`)

### Runtime dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@dnd-kit/core` | ^6.1.0 | Accessible drag-and-drop primitives — included for future section reordering in the CV editor |
| `@dnd-kit/sortable` | ^8.0.0 | Sortable list abstraction built on `@dnd-kit/core` — pairs with the core package for drag-to-reorder |
| `@dnd-kit/utilities` | ^3.2.2 | CSS transform helpers used alongside the sortable kit |
| `axios` | ^1.6.7 | HTTP client with request/response interceptors — the central `api.js` utility attaches JWT tokens to every outgoing request and handles 401 redirects globally |
| `react` | ^18.2.0 | UI rendering library — all pages and components are React functional components using hooks |
| `react-dom` | ^18.2.0 | DOM renderer for React — mounts the app into `#root` in `index.html` |
| `react-router-dom` | ^6.22.0 | Client-side routing — handles navigation between `/login`, `/register`, `/` (dashboard), and `/editor/:cvId` without full page reloads |
| `zustand` | ^4.5.0 | Lightweight global state manager — `authStore` holds user session and token; `cvStore` holds the active CV, all sections, and the latest ATS result |

### Dev dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ^18.2.55 | TypeScript type definitions for React — enables IDE autocomplete even though the project uses plain JSX |
| `@types/react-dom` | ^18.2.19 | TypeScript type definitions for React DOM |
| `@vitejs/plugin-react` | ^4.2.1 | Vite plugin that enables React Fast Refresh (HMR) and JSX transform during development |
| `autoprefixer` | ^10.4.17 | PostCSS plugin that adds vendor prefixes to CSS properties automatically — required by Tailwind's build pipeline |
| `postcss` | ^8.4.35 | CSS transformation tool that runs Tailwind and Autoprefixer — configured in `postcss.config.js` |
| `tailwindcss` | ^3.4.1 | Utility-first CSS framework — all UI styling uses Tailwind classes; custom colours (`ink`, `brand`) and animations are defined in `tailwind.config.js` |
| `vite` | ^5.1.0 | Build tool and dev server — serves the React app in development with HMR and produces an optimised production bundle via `npm run build` |

---

## Infrastructure dependencies (Docker images)

These are pulled by Docker Compose and require no manual installation.

| Image | Version | Purpose |
|-------|---------|---------|
| `postgres` | 15-alpine | Primary database — stores all users, CVs, sections, and ATS scores |
| `nginx` | alpine | Reverse proxy — handles SSL termination, static file serving, rate limiting, and routing between the API and frontend containers |
| `node` | 20-slim | Base image for the backend container — slim variant used to keep image size down |
| `node` | 20-alpine | Build stage base image for the frontend container — Alpine for a minimal build environment |

---

## Installing dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

In Docker, both `npm install` calls happen automatically during `docker compose up --build`.
