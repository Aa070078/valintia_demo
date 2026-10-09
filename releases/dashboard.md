# Releases — Dashboard

Append-only audit log for changes under `dashboard/`. Newest entry at the top.

## [2026-10-08 15:39] Replace runtime mock data with database-backed workspaces

**ID:** 20261008-1539-db-backed-workspaces
**By:** @abdelrhman632 (git config; gh unavailable)
**App:** dashboard
**Requested:** Create a new branch, remove runtime mock data, integrate temporary credential revocation in the branded admin frontend, and start port 3001 first.
**Scope:** `dashboard/components/admin/admin-dashboard.tsx`, `dashboard/components/pm/pm-dashboard.tsx`, `dashboard/components/engineer/engineer-dashboard.tsx`, `dashboard/features/engineer/`, `dashboard/lib/admin-api.ts`, deleted `dashboard/lib/mock-data.ts`

### Summary
Business data and successful mutations come from the API/database, with truthful empty/error states and a usable onboarding credential recovery action.

### Changes
- Removed empty/error demo project fallbacks, fake success transitions, seeded consultations/MOM, sample audit events, fixed analytics percentages/capacities and invented staff/file records.
- Engineer API uses the dashboard staff access token. Engineer name comes from the authenticated account; empty results remain empty and failed transitions show feedback without changing project status.
- Admin staff directory reads administrator-only GET /api/users so incomplete accounts are visible independently of assignment eligibility.
- Revoke/reissue uses the existing POST endpoint with a confirmation, pending-state protection, transient returned voucher, reload and error handling. Completed accounts have no revoke action. Staff controls are hidden from PM/owner roles.
- PM shares the actual project portfolio/assignment workflow; analytics and project history derive from API records. Unsupported scheduling/MOM/file-review displays do not invent persisted data.
- Started the dashboard on port 3001 first, as requested.

### Verification
- Client and dashboard production builds and TypeScript checks passed; targeted ESLint passed.
- All 14 browser checks passed (nine existing auth/onboarding checks plus five workspace/revoke checks), using intercepted adapters without real account/email changes.
- Server build and 17 auth/OTP/directory HTTP checks passed.
- Existing database-backed identity suite is blocked in setup: historical migration references public.SpaceType_old while running in an isolated schema. This is not a functional assertion failure in the directory feature.

### Notes
- Local branch: feat/db-backed-workspaces; no push or merge into master.
- Live database project schema repair remains required before real project CRUD/review can be tested. No normal-schema migrations, resets, account eligibility changes or real credential revocations were performed.
- Static form choices and automated test fixtures remain; runtime mock business records are removed. Unsupported consultation/MOM operations show unavailable.

---

## [2026-10-07 17:28] Connect frontend verification and onboarding sessions

**ID:** 20261007-1728-auth-onboarding-integration
**By:** @abdelrhman632
**App:** dashboard
**Requested:** Connect frontend authentication tokens automatically for seamless onboarding on a separate branch.
**Scope:** `dashboard/components/auth/auth-context.tsx`

### Summary
The dashboard consumes access credentials from the client handoff fragment, removes the fragment immediately, and validates the session with the existing `/auth/me` endpoint. Access credentials no longer travel in the HTTP query string during this handoff.

### Changes
- Read `access_token` from the fragment before loading the authenticated user; removed obsolete query-token parsing.

### Verification
- Dashboard production build, TypeScript check, and targeted ESLint passed.
- Client auth browser suite: 9 checks passed, including dashboard handoff, URL cleanup, and authenticated-user validation.
- Existing server auth/OTP suite: 15 tests passed.

### Notes
- Changes are local on `feat/auth-onboarding-integration`; nothing pushed or merged into master.
- Browser handoff verification uses API fixtures. The backend's bearer-token storage model is preserved.

---
