---
name: data-fetching
description: Valentia data layer — axios HTTP client + TanStack Query for server state. Use when fetching Nest APIs, caching, mutations, invalidation, or SSR hydration. Documented standard — packages may not be installed yet.
---

# Data fetching (axios + TanStack Query)

**API base:** Nest server (`API_PREFIX=api`, default `http://localhost:5000/api`)  
**Server state** lives in TanStack Query. **UI state** lives in Zustand (skill `state-management`). Never mirror the same entity in both.

## Axios

- Single instance per app with `baseURL` from env (e.g. `NEXT_PUBLIC_API_URL`).
- Request interceptor: attach auth (Bearer / cookie strategy as AuthModule lands).
- Response interceptor: normalize Nest errors to a stable `{ statusCode, message, code? }` shape.
- Timeouts and no silent swallow of 401/403 — route to login / forbidden UX.

```ts
// sketch — install axios when implementing
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 30_000,
});
```

## TanStack Query

- Query keys: hierarchical and stable — e.g. `['projects']`, `['projects', id]`, `['projects', id, 'boq']`.
- Mutations invalidate the minimal related keys.
- Optimistic updates only when rollback is defined.
- Prefer Query for lists, detail, and polling; use sockets (skill `realtime-sockets`) to **invalidate or patch** cache, not to replace Query.

### Provider sketch

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

## Boundaries

| Concern | Tool |
|---------|------|
| Server/domain data | TanStack Query + axios |
| Wizard step, drawer open, table filters | Zustand |
| Live push (status, notifications) | Socket.IO → invalidate/patch Query |

## Anti-patterns

- `useEffect` + `useState` for every GET
- Storing API lists in Zustand
- Ignoring error/loading/empty states
- Calling Nest from many ad-hoc `fetch` sites without the shared client
