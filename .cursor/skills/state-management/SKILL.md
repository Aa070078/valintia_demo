---
name: state-management
description: Zustand for Valentia client-only UI state. Use for wizards, filters, drawers, selections, and ephemeral UX — not for Nest server data. Documented standard — package may not be installed yet.
---

# State management (Zustand)

## Rule

**Zustand = client/UI state only.**  
**TanStack Query = server state** (skill `data-fetching`).

Good Zustand uses: project-creation wizard step, selected room tab, filter chips, sidebar collapsed, multi-select rows, ephemeral draft UI before submit.

Bad Zustand uses: projects list from API, invoice totals, payment status, engineer assignments.

## Slice sketch

```ts
import { create } from 'zustand';

type WizardState = {
  step: number;
  setStep: (step: number) => void;
  reset: () => void;
};

export const useProjectWizard = create<WizardState>((set) => ({
  step: 0,
  setStep: (step) => set({ step }),
  reset: () => set({ step: 0 }),
}));
```

## Persistence

Persist only intentional UX preferences (theme, sidebar). Do **not** persist secrets or authoritative workflow state. Prefer `partialize` when using `persist`.

## Anti-patterns

- Duplicating Query cache into Zustand
- Global god-store for the entire app
- Using Zustand for form field values that react-hook-form already owns
