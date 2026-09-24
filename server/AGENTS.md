# Server — agent guide

NestJS API for Fitout (shared by `client` and `dashboard`).

## Stack

- Nest 11, Prisma 7 (`@prisma/adapter-pg`), Redis (`ioredis`)
- Config: `src/infrastructure/config/` (`registerAs`)
- Swagger: `src/infrastructure/swagger/setup-swagger.ts`
- Logs: `src/infrastructure/application-logs/`

## Before coding

- Read root [`../AGENTS.md`](../AGENTS.md)
- Prefer stack rule `.cursor/rules/server-nest.mdc` and skills listed there
- No multi-tenant context — do not reintroduce it

## Releases

Audit changes in [`../releases/server.md`](../releases/server.md); update [`../releases/README.md`](../releases/README.md).
