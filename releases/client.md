# Releases — Client

Append-only audit log for changes under `client/`. Newest entry at the top.

## [2026-10-08 15:39] Replace runtime mock data with database-backed workspaces

**ID:** 20261008-1539-db-backed-workspaces
**By:** @abdelrhman632 (git config; gh unavailable)
**App:** client
**Requested:** Create a new branch, remove runtime mock data, integrate temporary credential revocation in the branded admin frontend, and start port 3001 first.
**Scope:** `client/features/auth/`, `client/features/projects/`, `client/features/dashboard/`, `client/features/notifications/`, `client/app/projects/new/page.tsx`, `client/.env.example`, `client/tests/auth/`

### Summary
Business data and successful mutations come from the API/database, with truthful empty/error states and a usable onboarding credential recovery action.

### Changes
- Removed demo personas, fake JWTs, role switching, local credential/password storage and simulated successful auth/project writes.
- Project adapters now propagate API errors. Project caches are scoped to the authenticated account; notifications start empty and derive from actual project changes.
- Removed seeded project/staff/operational datasets and unused duplicate staff API/modal. Legacy staff views link to the shared dashboard using the established fragment handoff.
- New project forms no longer select demo prefills. Consultation booking displays unavailable instead of saving fictitious local appointments.
- Added five browser checks for database-empty/error states, token isolation and revoke behavior; documented manual retesting.

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

## [2026-10-07 17:52] Branded bilingual welcome email

**ID:** 20261007-1752-branded-welcome-email
**By:** @abdelrhman632
**App:** client
**Requested:** Personalize the bilingual welcome email with the recipient's first name after verified registration.
**Scope:** `client/features/auth/api/auth.api.ts`, `client/tests/auth/onboarding.spec.ts`

### Summary
The registration adapter now supplies the first part of the existing name field as optional `firstName`. This field is used only in the backend welcome notification and does not change the verification/token flow or user schema.

### Changes
- Supply a trimmed first name of at most 80 characters when a registration name exists.
- Update the browser contract assertion for the optional name field.

### Verification
- Client TypeScript, targeted lint and all 9 auth browser tests passed.
- Restarted local client; signup returned HTTP 200. No real email sent by automated checks.

### Notes
- Local branch `feat/branded-welcome-email`; nothing pushed or merged.

---

## [2026-10-07 17:28] Connect frontend verification and onboarding sessions

**ID:** 20261007-1728-auth-onboarding-integration
**By:** @abdelrhman632
**App:** client
**Requested:** Create a separate branch and connect verification, onboarding, and login tokens automatically so frontend onboarding works without copying Swagger tokens.
**Scope:** `client/app/{login,signup,forgot-password}`, `client/features/auth`, `client/components/providers.tsx`, `client/lib/{api,auth}`, auth browser tests, dependency lockfile, environment example.

### Summary
Signup now verifies an inbox code and supplies its proof to registration before signing in by email. Restricted staff onboarding sessions stay separate from access credentials, resume after refresh, and finish email/password setup before obtaining normal access. Password reset carries its purpose-specific proof automatically. Internal roles receive their dashboard session through a URL fragment that the dashboard removes immediately.

### Changes
- Added registration verification dialog, reset-password UI, onboarding session storage, and role destination helper.
- Preserved explicit scoped Authorization headers and prevented the legacy password modal from blocking onboarding.
- Added `@playwright/test` ^1.63.0 and `npm run test:auth`; documented manual checks in `client/tests/auth/README.md`.
- Added `NEXT_PUBLIC_DASHBOARD_URL` to the environment example and ignored generated browser-test artifacts.

### Verification
- Client and dashboard production builds and TypeScript checks passed.
- ESLint passed for changed auth files.
- `npm run test:auth`: 9 browser checks passed using intercepted API responses; no live account or email mutations.
- Existing server `npm run test:auth-otp`: all 15 tests passed.

### Notes
- Work is on `feat/auth-onboarding-integration`; no push or master merge. Earlier local OTP diagnostics remain in the existing stash.
- Live inbox signup/reset needs an eligible controlled account, configured SMTP, Redis, and database. Browser fixtures verify frontend integration rather than live delivery.
- Local project APIs have a separate missing `projects.coverImage` database migration issue; no database reset or account eligibility changes were made.

---

## [2026-10-06 23:28] Customer Auth Session Safe Fallback & Display Name Resilience

**ID:** 20261006-2328-client-user-displayname-fallback  
**By:** @Antigravity  
**App:** client  
**Requested:** Fix runtime TypeError `Cannot read properties of undefined (reading 'split')` in `CustomerHeader` when logging in as a customer.  
**Scope:** `client/components/layout/customer-header.tsx`, `client/app/projects/new/page.tsx`, `client/features/auth/api/auth.api.ts`, `client/features/auth/components/sign-in-modal.tsx`, `client/features/dashboard/components/create-staff-modal.tsx`, `dashboard/components/admin/admin-dashboard.tsx`

### Summary
Resolved a runtime TypeError where customer sessions from the backend (`GET /auth/me` and `POST /auth/login`) return a user record with `username` and `email` without an explicit `name` column, causing `user.name.split(" ")` in `CustomerHeader` to throw undefined errors. Added safe fallback resolving `user.name || user.username || user.email || "Client"` across header initials, user button titles, modal user titles, and project wizard avatar initial.

### Verification
- `npm run typecheck` in `client/`: 0 errors.
- `npm run typecheck` in `dashboard/`: 0 errors.

---

## [2026-09-24 16:55] Architectural Visual Redesign & 3D Coverflow Alignment

**ID:** 20260924-1655-client-architectural-redesign  
**By:** @DeepCoder & @Antigravity  
**App:** client  
**Requested:** High-end architectural redesign pass matching the 5 visual panels of the primary reference image (pyramid panorama hero, 3+2 property cards, 3D Coverflow style discovery, isometric cutaway space toggles, design brief summary).  
**Scope:** `client/public/images/**`, `client/app/globals.css`, `client/features/projects/components/**`, `client/app/projects/page.tsx`, `client/app/projects/new/page.tsx`

### Summary
Completely transformed the customer frontend into a high-end luxury architectural studio experience matching the 5 panels of the attached visual reference:
1. Replaced generic hero with high-resolution Egypt Giza Pyramids luxury living room view (`/images/hero-pyramids.jpg`), vertical 6-step progress line, and floating 3D warm frosted card.
2. Built tall portrait property type selection cards (`aspect-[3/4]`) in a 3+2 layout with checkmark badges and discrete parameter inputs.
3. Created an authentic CSS 3D Y-axis perspective Coverflow (`perspective: 1200px`) for architectural style discovery with heart favorite button and 8-archetype capsule strip.
4. Integrated 3D isometric cutaway floorplan rendering (`/images/isometric-floorplan.jpg`) with space toggle switches.
5. Built the detailed design brief summary screen with twin specification cards, circular space avatars, inspiration carousel, and customer directives.

### Verification
- `npm run typecheck`: 0 errors
- `npm run lint`: 0 errors, 0 warnings
- `npm run build`: Production build succeeded in 5.3s (Turbopack)

---

## [2026-09-24 15:22] Valentia Sprint 1 Customer Frontend Foundation

**ID:** 20260924-1522-client-sprint1-foundation  
**By:** @Antigravity  
**App:** client  
**Requested:** Prepare the Valentia customer frontend foundation for Sprint 1 inside `client/` following the visual reference and design system.  
**Scope:** `client/package.json`, `client/app/globals.css`, `client/app/layout.tsx`, `client/app/page.tsx`, `client/components/providers.tsx`, `client/components/layout/**`, `client/lib/api/**`, `client/features/projects/**`, `client/app/projects/**`

### Summary
Built the complete, reusable frontend foundation for the customer-facing Valentia platform supporting the Sprint 1 scope (Projects List, Create Project, Property Information, Edit Project, and Submit Project). Realigned design tokens to exact Valentia Espresso (`#503C2C`) and Copper (`#B88460`) palettes, integrated `Cinzel` and `Inter` typography, installed and configured `axios`, `@tanstack/react-query`, `react-hook-form`, `zod`, and `@hookform/resolvers`. Constructed an editorial, architecture-journal aesthetic for the customer flow without overengineering.

### Changes
- Installed `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`
- Applied Valentia brand tokens (Espresso, Copper, Slate, Blueprint) and warm surface tokens (`#FAF8F6`) in `client/app/globals.css`
- Configured editorial serif (`Cinzel`) and sans (`Inter`) in `client/app/layout.tsx`
- Added `QueryClientProvider` to `client/components/providers.tsx`
- Created centralized Axios HTTP client with error normalizer in `client/lib/api/client.ts`
- Created domain types, Zod schemas, and API service with fallback state in `client/features/projects/`
- Implemented TanStack Query hooks (`useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useSubmitProject`)
- Created architectural UI components: `EditorialHeader`, `StatusChip`, `ImageSelectCard`, `ProjectCard`, `ProjectsGrid`, `EmptyProjectsState`, `PropertyInfoForm`, `SpacesSelector`, and `ProjectReviewCard`
- Created Customer shell and header with Valentia architectural monogram in `client/components/layout/`
- Implemented App Router pages:
  - `/` -> redirects to `/projects`
  - `/projects` -> Projects list and zero-state hero plate
  - `/projects/new` -> 3-step Intake Wizard (Property Info -> Spaces -> Review & Submit)
  - `/projects/[id]` -> Project details overview with status and submit/edit actions
  - `/projects/[id]/edit` -> Edit project details and spatial scope

### Verification
- `npm run typecheck` passed (exit code 0, 0 errors)
- `npm run lint` passed (exit code 0, 0 errors)
- `npm run build` passed (exit code 0, static and dynamic routes compiled successfully via Turbopack)
