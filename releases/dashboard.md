# Releases — Dashboard

Append-only audit log for changes under `dashboard/`. Newest entry at the top.

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
