# Running FocusForge AI Locally

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- PHP 8.2+ with extensions: `pdo_pgsql`, `pgsql`, `pdo_sqlite`
- [Composer](https://getcomposer.org/)
- Node.js 20+ and npm

---

## 1. Start Docker Containers

From the repo root:

```bash
docker-compose up -d
```

This starts:

| Container | Service | Port |
|---|---|---|
| `focusforge_db` | PostgreSQL 16 | `5433` |
| `focusforge_redis` | Redis 7 | `6379` |
| `focusforge_mail` | Mailpit (SMTP + UI) | `1025` / `8025` |

Check everything is running:

```bash
docker-compose ps
```

---

## 2. Backend (Laravel API)

```bash
cd focusforge-api
```

### First-time setup

```bash
# Install dependencies
composer install

# Copy environment file
copy .env.example .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate
```

### Start the dev server

```bash
php artisan serve
```

API is available at **http://localhost:8000**

---

## 3. Frontend (Next.js)

```bash
cd focusforge-web
```

### First-time setup

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

App is available at **http://localhost:3000**

---

## Quick Start (all together)

Open three terminals and run:

```bash
# Terminal 1 — Docker
docker-compose up -d

# Terminal 2 — API
cd focusforge-api && php artisan serve

# Terminal 3 — Frontend
cd focusforge-web && npm run dev
```

---

## Useful URLs

| URL | Description |
|---|---|
| http://localhost:3000 | Frontend app |
| http://localhost:8000/api/v1 | API base URL |
| http://localhost:8025 | Mailpit email UI |

---

## Stopping Services

```bash
# Stop Docker containers
docker-compose down

# Stop with data wipe (fresh DB)
docker-compose down -v
```

---

## Running Backend Tests

```bash
cd focusforge-api
php artisan test
```

Tests use an in-memory SQLite database — no Docker required.
