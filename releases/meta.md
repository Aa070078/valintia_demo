# Releases — Meta

Append-only audit log for rules, skills, docs, `.cursor/`, root `AGENTS.md`, and `releases/**` (when no app code changed). Newest entry at the top.

## [2026-09-03 21:02] Valentia brand, design system, business doc, and stack skills

**ID:** 20260903-2102-valentia-brand-skills
**By:** @MahmoudMater
**App:** meta
**Requested:** Use the Valentia logo and BRD to create brand identity, design system, valentia-business.md, frontend/backend skills and rules, and a GitHub README with the logo
**Scope:** `assets/brand/`, `design.md`, `design-system/valentia/`, `valentia-business.md`, `README.md`, `AGENTS.md`, `.cursor/skills/{nextjs-16,form-validation,data-fetching,state-management,realtime-sockets,nestjs-patterns}/`, `.cursor/rules/{valentia-context,frontend-stack,fitout-workflow,client-next,dashboard-next,server-nest}.mdc`

### Summary
Branded the product as Valentia — Design & Build while keeping the `fitout/` folder name. Sampled logo colors, persisted a ui-ux-pro-max design system, and curated `design.md` plus an agent-facing business extraction from the BRD. Added documented (not installed) skills for Next 16, forms, axios/Query, Zustand, Socket.IO, and Nest BRD guardrails, with matching Cursor rules and a logo README.

### Changes
- Added `assets/brand/valentia-logo.png` (logo copy); locked espresso `#503C2C`, copper `#B88460`, slate `#707070`
- Ran ui-ux-pro-max → `design-system/valentia/MASTER.md`; wrote curated `design.md`
- Wrote `valentia-business.md` from the BRD
- New skills: `nextjs-16`, `form-validation`, `data-fetching`, `state-management`, `realtime-sockets`, `nestjs-patterns`
- New rules: `valentia-context.mdc`, `frontend-stack.mdc`; updated workflow + client/dashboard/server rules
- Wrote root `README.md` with logo; updated `AGENTS.md` for Valentia docs

### Verification
- Design-system persist succeeded; logo file present under `assets/brand/`
- Skills/rules files written under `.cursor/`
- Data-layer packages intentionally not installed (docs-only pass)

### Notes
- axios / TanStack Query / Zustand / RHF / Zod / Socket.IO remain install-later
- Folder/package rename to `valentia/` was out of scope

## [2026-09-03 20:43] Fitout rules, skills flow, and multi-app release audit

**ID:** 20260903-2043-rules-skills-releases
**By:** @MahmoudMater
**App:** meta
**Requested:** Implement the plan for Fitout rules, skills flow, and multi-app release audit
**Scope:** `.cursor/rules/**`, `AGENTS.md`, `releases/**`, `client/AGENTS.md`, `dashboard/AGENTS.md`, `server/AGENTS.md`, `server/README.md`

### Summary
Replaced single-file release logging with a central `releases/` index plus independent client, dashboard, server, and meta audit logs. Added always-on skill-routing workflow rule (ask-matt flow) and glob-scoped Nest/Next stack rules. Seeded thin root and package `AGENTS.md` pointers so agents know where to read and where to audit.

### Changes
- Created `releases/README.md` (index), `releases/client.md`, `releases/dashboard.md`, `releases/server.md`, `releases/meta.md`
- Rewrote `.cursor/rules/release-logging.mdc` for multi-app routing, rich audit template, and index updates
- Added `.cursor/rules/fitout-workflow.mdc` (skill routing table)
- Added `.cursor/rules/server-nest.mdc`, `client-next.mdc`, `dashboard-next.mdc`
- Added root `AGENTS.md` and `server/AGENTS.md`; extended `client/AGENTS.md` and `dashboard/AGENTS.md`
- Linked release logs from `server/README.md`

### Verification
- Files created/updated on disk under `fitout/` as listed above
- Release rule loop exercised by this meta entry + index update

### Notes
- Duplicate skill folders (`session-handoff copy`, `gepetto copy`) left unused per plan
- App `AGENTS.md` pointer edits are documented here as part of the meta setup (bootstrap)
