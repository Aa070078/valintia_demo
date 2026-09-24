---
name: realtime-sockets
description: Socket.IO realtime channel between Nest and Valentia Next apps. Use when designing live project updates, notifications, or site-visit tracking. Documented only — do not install or wire code unless asked.
---

# Realtime sockets (Nest ↔ Next)

**Goal:** open a realtime channel for project events (BRD §50 notifications, site-visit tracking, design uploads, payment outcomes) without replacing REST as the source of truth.

## Nest side (documented)

- `@WebSocketGateway` (Socket.IO) with CORS aligned to `ALLOWED_ORIGINS`.
- Auth on handshake: JWT (or session cookie strategy) — reject anonymous sockets for private rooms.
- Rooms: `project:<projectId>`, optionally `user:<userId>` for personal notifications.
- Emit after successful domain mutations (same transaction/outbox mindset as HTTP).
- Event names: stable, past-tense domain events, e.g. `project.status_changed`, `site_visit.arrived`, `design.uploaded`, `payment.succeeded`.

## Next side (documented)

- Shared hook in `client` and `dashboard`: connect once per session, join rooms as the user opens a project.
- On event: **invalidate or patch TanStack Query** keys — do not invent a second client database.
- Reconnect with backoff; show subtle offline/live indicator when useful.
- Never trust a socket payload alone for payment success or workflow unlock — confirm via REST if needed.

## Event ↔ Query mapping (examples)

| Event | Query action |
|-------|----------------|
| `project.status_changed` | invalidate `['projects', id]` |
| `notification.created` | invalidate `['notifications']` |
| `site_visit.status_changed` | invalidate visit + project keys |

## Anti-patterns

- Socket as sole write path for money or status transitions
- Unauthenticated project rooms
- Duplicating full entity trees over the wire when an id + invalidate suffices

## Related

`data-fetching`, `nestjs-patterns`, `valentia-business.md` (§13 notifications)
