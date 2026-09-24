# Fitout API Server

NestJS backend for the Interior Design & Fit-Out platform (shared by `client` and `dashboard`).

## Prerequisites

- Node.js 20+
- Docker Desktop running

## Quick start

```bash
cd server
cp .env.example .env   # or use the existing local .env
npm install
npm run docker:up
npm run prisma:generate
npm run start:dev
```

- API: http://localhost:5000/api  
- Health: http://localhost:5000/api/health  
- Swagger UI: http://localhost:5000/docs  
- OpenAPI YAML: http://localhost:5000/yaml (also `/ymal`, `/api/yaml`, `/api/ymal`)  

In production (`NODE_ENV=production`), Swagger/YAML routes require HTTP Basic Auth (`SWAGGER_USER` / `SWAGGER_PASSWORD`).

Release audit log: [`../releases/server.md`](../releases/server.md) (index: [`../releases/README.md`](../releases/README.md)).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run docker:up` | Start Postgres 16 + Redis 7 |
| `npm run docker:down` | Stop containers |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create/apply migrations (when models exist) |
| `npm run prisma:studio` | Prisma Studio UI |
| `npm run start:dev` | Nest watch mode |

## Layout

```text
src/
  infrastructure/
    config/            # typed env (ConfigModule)
    database/          # PrismaModule + PrismaService
    redis/             # RedisModule
    application-logs/  # file logs + request interceptor
  common/              # shared utils / decorators
  infrastructure/swagger/  # Swagger UI + OpenAPI YAML setup
  health/              # GET /api/health
```

Application logs are written to `application-logs/` (gitignored).
