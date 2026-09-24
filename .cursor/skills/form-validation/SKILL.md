---
name: form-validation
description: Standard form validation for Valentia Next apps using react-hook-form + Zod. Use when building forms, wizards, DTO-aligned schemas, or Server Action validation. Documented standard — packages may not be installed yet.
---

# Form validation (react-hook-form + Zod)

**Standard for:** `client/`, `dashboard/`  
**Stack (to install when implementing):** `react-hook-form`, `@hookform/resolvers`, `zod`

## Principles

- Visible **labels** (never placeholder-only).
- Validate on **blur** for most fields; show errors **next to the field**.
- Mark required fields clearly.
- Submit feedback: loading → success/error (skill `ui-ux-pro-max` forms guidance).
- Same Zod shapes should map cleanly to Nest DTO contracts where possible.

## Pattern

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  projectName: z.string().min(1, 'Required'),
  budget: z.number().positive().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ExampleForm({ onSubmit }: { onSubmit: (v: FormValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="projectName">Project name *</label>
      <input id="projectName" {...register('projectName')} />
      {errors.projectName && <p role="alert">{errors.projectName.message}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
```

## Schema location

Suggested (when code lands):

```text
client/src/lib/validation/
dashboard/src/lib/validation/
```

Share pure Zod schemas that mirror Nest DTOs; do not import Nest code into Next.

## Server Actions

If using a Server Action, parse with `schema.safeParse` on the server and return field errors. Never trust client-only validation for payment, workflow transitions, or RBAC-sensitive fields.

## Anti-patterns

- Validate only on submit with a single top-of-form error dump
- `autocomplete="off"` everywhere
- `type="text"` for email/tel when a better input type exists
- Silent submit with no loading state
