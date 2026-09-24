---
name: nestjs-patterns
description: NestJS patterns and Valentia BRD backend guardrails — modules, DTOs, RBAC, payment gates, audit, scheduling, Swagger, AI non-authority. Use when building or reviewing server/ code.
---

# NestJS patterns (Valentia server)

**App:** `server/` — Nest 11, Prisma 7, Redis, Swagger already bootstrapped.  
**Business:** [`valentia-business.md`](../../../valentia-business.md)  
**Stack rule:** `.cursor/rules/server-nest.mdc`

## Module layout

```text
FeatureModule
  ├─ controller  (HTTP, Swagger decorators)
  ├─ service     (domain logic)
  ├─ dto/        (class-validator)
  └─ (optional) gateway events after successful mutation
```

- Config only via `registerAs` + `ConfigService` — no secrets in code.
- DB only through `PrismaService`; Redis through `RedisService`.
- Document endpoints with `@ApiTags` / `@ApiOperation` / auth schemes.

## DTOs and validation

- `class-validator` + `ValidationPipe` (whitelist, forbidNonWhitelisted, transform) already global.
- Align field names with Zod schemas on the frontends where practical.
- Never accept client-supplied “paymentSucceeded” or “newStatus” without server rules.

## BRD guardrails (must enforce on API)

| Rule | Enforcement |
|------|-------------|
| Payment gates | Unlock design / site visit / BOQ / execution only after **verified** payment |
| RBAC | Guards + permissions on every sensitive route |
| No double booking | Transactional slot reservation |
| Workflow transitions | Explicit allowed transitions; reject illegal jumps |
| Audit log | Actor, action, entity, before/after — separate from customer activity timeline |
| Data trust | Do not overwrite Engineer Verified with AI/CAD |
| AI non-authority | AI must not set money, critical measurements, or terminal project state |
| Webhooks | Idempotent payment/provider handlers |
| Multi-tenant | **Not used** — do not reintroduce tenant scoping |

## Swagger

- Public docs in non-prod; Basic Auth in production (`SWAGGER_*`).
- Keep OpenAPI accurate — FE may generate types via `openapi-to-typescript`.

## Realtime

After successful mutations that customers/staff should see live, emit Socket.IO events (skill `realtime-sockets`). HTTP remains the write authority.

## Anti-patterns

- Business rules only in Next.js
- Trusting frontend for payment or status
- Fat controllers with Prisma calls and no service layer
- Logging secrets or full card payloads
