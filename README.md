# Boilerplate MedusaJS + Next.js — Docker Setup

This repository is dockerized to run a full local stack:

- Postgres 16
- Redis 7
- Medusa API (port 9000)
- Next.js web storefront (port 3000)

All Docker artefacts are at the repo root:

- `docker-compose.yml`
- `.env.example` (copy to `.env`)
- `medusa/Dockerfile`
- `web/Dockerfile`

## Prerequisites

- Docker Desktop (or Docker Engine) with Compose v2
- Node 20+ if you plan to run locally without Docker (not required for Docker)

## 1) Configure environment variables

Copy the example file and edit values if needed:

```bash
cp .env.example .env
```

Required variables:

- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` — publishable API key for the storefront.
- `MEDUSA_BACKEND_URL` — how the browser reaches the Medusa API. Defaults to `http://localhost:9000` in Docker.

Medusa API defaults:

- `DATABASE_URL=postgresql://medusa:medusa@db:5432/medusa`
- `STORE_CORS=http://localhost:3000`
- `ADMIN_CORS=http://localhost:7001`
- `AUTH_CORS=http://localhost:3000`
- `JWT_SECRET` and `COOKIE_SECRET` set to `supersecret` by default (change for real use!)
- `REDIS_URL=redis://redis:6379`

## 2) Start the stack

Build containers (first time or after Dockerfile changes):

```bash
docker compose build
```

Start containers:

```bash
docker compose up -d
```

Check logs (tail all services):

```bash
docker compose logs -f
```

## 3) Access the apps

- Web storefront: http://localhost:3000
- Medusa API: http://localhost:9000
- Postgres: localhost:5432 (inside Docker network: `db:5432`)
- Redis: localhost:6379 (inside Docker network: `redis:6379`)

## 4) Seed sample data

Drone extension is added and data is automatically seed when medusa starts.

## 5) Stopping and cleaning up

Stop containers:

```bash
docker compose down
```

Stop and remove volumes (DB data):

```bash
docker compose down -v
```

## Environment overview

- Medusa config: `medusa/medusa-config.ts` reads from environment variables such as `DATABASE_URL`, `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`, `JWT_SECRET`, `COOKIE_SECRET`.
- Web config: `web/src/lib/config.ts` reads `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- `web/next.config.js` enforces the presence of `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` at startup.

## Notes

- Containers run with `NODE_ENV=production` and use `yarn start` within each service.
- Ports exposed:
  - Medusa: `9000:9000`
  - Web: `3000:3000`
  - Postgres: `5432:5432`
  - Redis: `6379:6379`
- Change any values in `.env` and re-run `docker compose up -d`.
- Get NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY from settingd medusa admin panel (localhost:9000)
- To add admin user run(define your own email and password) :

```bash
docker compose run --rm medusa npx medusa user -e admin@gmail.com -p admin1234
```


## Troubleshooting

- If the web container exits immediately with an env error, ensure `.env` contains `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- If Medusa fails to connect to DB, verify `DATABASE_URL` and that the `db` service is healthy (`docker compose ps`).
- For a clean state, run `docker compose down -v` to remove volumes and start again.
