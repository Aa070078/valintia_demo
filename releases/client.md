# Releases — Client

Append-only audit log for changes under `client/`. Newest entry at the top.

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
