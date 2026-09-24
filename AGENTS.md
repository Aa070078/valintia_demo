# Valentia — agent guide

**Product:** Valentia — Design & Build  
**Repo folder:** `fitout/` (unchanged)

Read the package `AGENTS.md` before coding in that app. Read business and design docs before feature/UI work.

## Source docs

| Doc | Use |
|-----|-----|
| [`valentia-business.md`](./valentia-business.md) | Agent-facing business (from BRD) |
| [`Business Requirements Document (BRD).md`](./Business%20Requirements%20Document%20(BRD).md) | Full BRD |
| [`design.md`](./design.md) | Brand + design system |
| [`design-system/valentia/MASTER.md`](./design-system/valentia/MASTER.md) | Generated ui-ux-pro-max artifact |

## Apps

| Path | Role | Stack |
|------|------|--------|
| [`client/`](./client/) | Customer-facing web | Next.js 16 |
| [`dashboard/`](./dashboard/) | Admin / ops web | Next.js 16 (port 3001) |
| [`server/`](./server/) | Shared API | NestJS 11, Prisma 7, Redis |

There is **no multi-tenant** model on this server.

## Workflow

- Always-on: `.cursor/rules/valentia-context.mdc`, `fitout-workflow.mdc`, `release-logging.mdc`
- Skill routing maps tasks → `.cursor/skills/` (includes `nextjs-16`, `form-validation`, `data-fetching`, `state-management`, `realtime-sockets`, `nestjs-patterns`)
- Unsure which skill? Use **`ask-matt`**.
- Stack rules: `frontend-stack`, `server-nest`, `client-next`, `dashboard-next`

## API facts (server)

- Prefix: `/api`
- Health: `GET /api/health`
- Swagger UI: `/docs`
- OpenAPI YAML: `/yaml`, `/ymal`, `/api/yaml`, `/api/ymal`
- Production: HTTP Basic Auth on docs/YAML via `SWAGGER_USER` / `SWAGGER_PASSWORD` when `NODE_ENV=production`

## Releases (audit)

- Index: [`releases/README.md`](./releases/README.md)
- Per app: `releases/client.md`, `dashboard.md`, `server.md`, `meta.md`
