# API Handoff: Phase 6 Engineer Review Foundation

## Coordination status

**Implemented contract, pending Backend B and the single Frontend owner's acknowledgment.**
Their identities/channel were requested but have not been supplied. No coordination
message has been sent, no team agreement is claimed, and no UI wiring was changed.
Confirm this contract before integrating the UI, particularly the exact status names,
submission ownership, missing project-context fields and consultation scheduling boundary.

## Business context

**Authentication prerequisite:** An internal Engineer must verify a real email and
replace the temporary password before accessing review. `temporaryLogin` returns
only a restricted `onboardingToken`; review requires a fresh `accessToken` from
verified-email login after completion. Assignments continue to use the same User ID.
See [account provisioning handoff](../account-provisioning/api-handoff.md).

An assigned Engineer reviews a submitted Project and marks it ready for the free
consultation. The Project remains the parent entity. This foundation records review
state and history; it does not book consultations or introduce Site Visits, payments,
Design Packages, BOQ, or later phases.

## Status and action contract

Backend values are exact, uppercase strings. Assignment is a relation, not a status.

| Current status | Allowed action for assigned Engineer | Endpoint suffix | Result | Display label |
|---|---|---|---|---|
| `DRAFT` | none | — | — | Draft |
| `SUBMITTED` with assignment | `START_REVIEW` | `/review/start` | `UNDER_ENGINEER_REVIEW` | Submitted |
| `UNDER_ENGINEER_REVIEW` | `MARK_READY_FOR_CONSULTATION` | `/review/ready-for-consultation` | `ENGINEER_READY` | Under Engineer Review |
| `ENGINEER_READY` | none | — | — | Ready for Consultation |

```text
Backend B's authorized submission action -> SUBMITTED
PM/Admin assignment -> assigned Engineer relation (status unchanged)
assigned Engineer starts review -> UNDER_ENGINEER_REVIEW
assigned Engineer marks consultation readiness -> ENGINEER_READY
consultation scheduling -> separate follow-on contract owned/coordinated with Backend B
```

No `ASSIGNED`, `INITIAL_REVIEW`, `ENGINEER_REVIEW`, or lowercase status aliases are
accepted as replacements for these values. Existing customer/dashboard UI proposals
use different aliases; Frontend must reconcile its adapter/types with this contract.

## Endpoints

All paths include `/api`. Send the normal access JWT as `Authorization: Bearer TOKEN`.
Existing password and OTP login methods can obtain that access token.

### GET /api/projects/:id/review

- Auth: ENGINEER **and** currently assigned to this Project. PM/Admin/Owner cannot
  act as the Engineer; their existing Project reads remain available separately.
- Input: integer Project ID; no request body.
- Success: 200 `ProjectReviewContext` below. Reading does not change status.
- Context includes all data currently persisted for this feature: Project identity,
  status, customer identity, property, spaces, assignment/Engineer identity, project
  notes, review activity and `allowedActions`. Credentials are never returned.
- Errors: 400 malformed ID; 401 missing/invalid access token; 403 wrong role or
  assignment; 404 Project absent.

### POST /api/projects/:id/review/start

- Auth: assigned ENGINEER only.
- Precondition: `SUBMITTED` and an assignment to the caller.
- Input: `{}` or optional customer-visible note:
  ```json
  { "note": "Beginning review of the submitted project information." }
  ```
- Success: 200:
  ```json
  {
    "projectId": 1,
    "status": "UNDER_ENGINEER_REVIEW",
    "activity": {
      "id": 1,
      "projectId": 1,
      "actorId": 3,
      "actorRole": "ENGINEER",
      "action": "REVIEW_STARTED",
      "fromStatus": "SUBMITTED",
      "toStatus": "UNDER_ENGINEER_REVIEW",
      "note": "Beginning review of the submitted project information.",
      "createdAt": "2026-10-02T14:30:00.000Z"
    },
    "allowedActions": ["MARK_READY_FOR_CONSULTATION"]
  }

  ```
- Errors: 400 invalid ID/note or unknown fields; 401 unauthenticated; 403 wrong
  role/assignment; 404 absent Project; 409 wrong/changed state or repeated action.

### POST /api/projects/:id/review/ready-for-consultation

- Auth: assigned ENGINEER only.
- Precondition: `UNDER_ENGINEER_REVIEW`.
- Input: same optional note shape as start, for example:
  ```json
  { "note": "Reviewed available information; ready to discuss the requirements." }
  ```
- Success: 200 `ReviewTransition` with `status: ENGINEER_READY`,
  `activity.action: CONSULTATION_READY`, `fromStatus: UNDER_ENGINEER_REVIEW`,
  `toStatus: ENGINEER_READY`, and `allowedActions: []`.
- Errors: same 400/401/403/404/409 meanings as start.
- Readiness does **not** create a meeting, payment, appointment or later-phase record.

### GET /api/projects/:id/activity

- Auth: owning CUSTOMER, assigned ENGINEER, or PROJECT_MANAGER/COMPANY_OWNER/ADMINISTRATOR.
- Success: 200 `ProjectActivity[]`, chronological by `createdAt` then `id`. Empty array
  for a Project with no recorded review actions. Notes are customer-visible.
- Errors: 400 malformed ID, 401 unauthenticated, 403 another Customer's/unassigned
  Engineer's Project, 404 absent Project.
- This is Project activity history, separate from a future platform-wide audit log.
  Existing creation/submission/assignment events are not backfilled here.

### Existing POST /api/projects/:id/assign

PM/Admin can assign/reassign in `DRAFT` or `SUBMITTED`. Once review starts, return
409 without changing assignment. There is no reopen/reset/reassignment-after-review
action in this foundation. Other roles receive 403. Invalid non-Engineer targets
receive 400; missing Project/Engineer receives 404.

## Models

Dates are ISO 8601 strings over HTTP; IDs are numbers. Decimal area is a string.

```typescript
type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_ENGINEER_REVIEW' | 'ENGINEER_READY';
type ReviewAction = 'START_REVIEW' | 'MARK_READY_FOR_CONSULTATION';
type Role = 'CUSTOMER' | 'ENGINEER' | 'PROJECT_MANAGER' | 'COMPANY_OWNER' | 'ADMINISTRATOR';
type SpaceType = 'LIVING_ROOM' | 'KITCHEN' | 'MASTER_BEDROOM' | 'BEDROOM' | 'BATHROOM' | 'BALCONY';

interface Identity { id: number; username: string }
interface Property {
  id: number; projectId: number; propertyType: string; areaSqm: string;
  city: string; compound: string | null; createdAt: string; updatedAt: string;
}
interface Space {
  id: number; projectId: number; type: SpaceType; createdAt: string; updatedAt: string;
}
interface Assignment {
  id: number; projectId: number; engineerId: number; createdAt: string; engineer: Identity;
}
interface ProjectActivity {
  id: number; projectId: number; actorId: number; actorRole: Role;
  action: 'REVIEW_STARTED' | 'CONSULTATION_READY';
  fromStatus: ProjectStatus; toStatus: ProjectStatus;
  note: string | null; createdAt: string;
}
interface ProjectReviewContext {
  id: number; title: string; status: ProjectStatus; notes: string | null;
  clientId: number; client: Identity; property: Property | null; spaces: Space[];
  assignment: Assignment; activities: ProjectActivity[]; allowedActions: ReviewAction[];
  createdAt: string; updatedAt: string;
}
interface ReviewActionRequest { note?: string | null }
interface ReviewTransition {
  projectId: number; status: ProjectStatus; activity: ProjectActivity;
  allowedActions: ReviewAction[];
}
```

## Validation and permissions

- Only optional `note` is accepted by the two action DTOs. It is trimmed, nonblank
  when a string is supplied, and limited to 2000 characters. Null/omitted note is allowed.
- Never send status, actor, role, engineer ID, readiness booleans, or other workflow
  fields. The backend rejects unknown fields with 400, including arbitrary status
  on the existing Project PATCH endpoint.
- CUSTOMER/PM/Owner/Admin cannot start or finish Engineer review, even if they can
  read Project history or assign an Engineer.
- An Engineer cannot act on a different Engineer's Project or an unassigned Project.
- DRAFT may be viewed by its assigned Engineer but has no available review action.

## Integration and concurrency

Fetch review context, render the available persisted information and use
`allowedActions` to decide which command to offer. POST the action, then refresh
Project details, list, review context and activity caches. Avoid optimistic status
changes: a concurrent action/reassignment can return 403 or 409.

State and history commit together. Repeated actions return 409 and do not duplicate
history. Concurrent identical actions yield one success. Assignment and review
serialize so an old Engineer cannot start after reassignment has taken effect.

There are no socket events in the current backend; refresh after mutations and on
re-entering the view. Do not assume readiness means consultation has been booked.

Typical errors follow Nest's `{ statusCode, message, error }` response shape;
validation `message` can be an array. Show authorization failures and refetch on
409 rather than offering the client a status override.

## Acceptance scenarios

1. Submitted + assigned Engineer: read context, start, mark ready; two ordered activities.
2. Draft or ready-before-start: 409; no status/history change.
3. Owning Customer, PM, or unassigned Engineer attempting review: 403.
4. Arbitrary status/actor payload, blank/oversized note: 400.
5. Repeat/concurrent action: one transition, no duplicate history.
6. History insert failure: Project transition rolls back.
7. Customer reads own history; another Customer/Engineer cannot read it.

## Backend B / Frontend acknowledgment checklist

- [ ] Both owners confirm the exact uppercase status/action/endpoint contract above.
- [ ] Backend B supplies an authorized submission action that yields SUBMITTED and
      coordinates assignment access; this branch does not implement Phase 5 submission.
- [ ] Backend B confirms persisted review-context fields. Preferences, references,
      drawings/CAD, budget, target timeline and broader customer profile fields do
      not exist in the current backend schema, so this API cannot yet return them.
- [ ] Frontend reconciles existing `initial_review` / `ENGINEER_REVIEW` mock aliases,
      consumes numeric IDs/decimal strings, and treats notes as customer-visible.
- [ ] Backend B confirms the follow-on consultation scheduling contract; Engineer Ready
      is the integration boundary here, not a booking or paid-service gate.
- [ ] Owners agree whether future reopening/reassignment/internal notes are required;
      none are implemented in this foundation.
- [ ] Apply the additive review migration to the target environment before using the API.

PostgreSQL-backed tests have exercised migrations, role/assignment checks, atomic
history, concurrency and Swagger in a temporary schema. The normal application
schema was not migrated, and no frontend was modified.
