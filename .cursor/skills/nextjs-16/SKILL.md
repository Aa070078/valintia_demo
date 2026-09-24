---
name: nextjs-16
description: Next.js 16.x (App Router) + React 19.2 patterns for Valentia client/dashboard. Use when building or reviewing Next pages, layouts, Server Components, Server Actions, caching, streaming, route handlers, or metadata. Verify claims against official Next docs — training data may be stale.
---

# Next.js 16 (Valentia)

**Apps:** `client/` (Next 16.2.x), `dashboard/` (Next 16.2.x, port 3001)  
**React:** 19.2.x  

## Verify before coding

1. Prefer `node_modules/next/dist/docs/` in the app if present.
2. If missing (deps not installed), use official docs: https://nextjs.org/docs — do **not** invent APIs from memory.
3. Cross-check React patterns with skills `react-dev` and `react-useeffect`.

## Hard requirements in Next 16

| Topic | Rule |
|-------|------|
| Async request APIs | **Await** `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` — sync access is a hard error |
| Bundler | Turbopack is default; opt out with `--webpack` only if required |
| Node | ≥ 20.9 |
| App Router | Use `app/` for new routes; do not start new `pages/` routes |
| Lint | Prefer ESLint CLI / project scripts — do not rely on removed `next lint` workflows |

Codemod when migrating legacy sync access:

```bash
npx @next/codemod@latest next-async-request-api .
npx next typegen
```

### Example — page with async params

```tsx
export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await props.params;
  const query = await props.searchParams;
  return <div>{id}</div>;
}
```

In Client Components that receive a Promise prop, unwrap with `React.use(params)`.

## Architecture defaults for Valentia

- Server Components by default; add `'use client'` only for interactivity, browser APIs, or local state.
- Data from Nest API: browser/client via axios + TanStack Query (skill `data-fetching`). Do not treat Next Route Handlers as the system of record for domain data.
- Auth cookies / tokens: read with `await cookies()` on the server; never trust payment or workflow state from the client alone.
- Streaming: wrap slow segments in `<Suspense>`; use `loading.tsx` where it improves perceived performance.
- Metadata: `generateMetadata` must also `await` params when used.
- Images: `next/image` with explicit sizes; prefer WebP/AVIF sources when available.

## Caching / revalidation notes

- Prefer explicit cache tags for Nest-backed entities (project, invoice, etc.).
- If using `revalidateTag`, follow the **Next 16 signature** (tag + cacheLife profile) — verify in current docs before calling.
- Server Actions: validate with Zod (skill `form-validation`); revalidate or invalidate Query keys after mutations.

## Anti-patterns

- Sync `cookies()` / `params` access
- Fetching Nest as the only path inside RSC without a clear error/loading boundary
- Duplicating server state into Zustand
- Building domain APIs in Next when Nest already owns them

## Related skills

`react-dev`, `react-useeffect`, `form-validation`, `data-fetching`, `state-management`, `realtime-sockets`, `frontend-design`, `ui-ux-pro-max`
