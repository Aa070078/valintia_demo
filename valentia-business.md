# Valentia Business (agent source)

**Product brand:** Valentia — Design & Build  
**Authoritative long form:** [`Business Requirements Document (BRD).md`](./Business%20Requirements%20Document%20(BRD).md)  
**UI contract:** [`design.md`](./design.md)

## How to use this file

- Read **before** implementing any feature that touches workflow, money, roles, scheduling, or AI.
- Prefer this file for day-to-day agent context; open the BRD when you need full narrative detail.
- Do not invent statuses, payment gates, or roles that contradict this document.
- Repo folder remains `fitout/`; product name in copy and docs is **Valentia**.

---

## 1. Product definition

Valentia is a digital platform for an interior design and fit-out company. It covers the customer journey from project request and design preferences through drawings, consultation, site survey, design production, BOQ, quotation, procurement, warehouse, execution, progress tracking, and handover — plus workspaces for Engineers, Project Managers, Owners, and Administrators.

**Core entity:** the **Project**. One customer may own many projects; each project has an independent workflow, finances, documents, appointments, designs, BOQ, procurement, and execution state.

Combines: Customer experience + Project management + Design ops + Commercial + Procurement + Execution + AI assistance (non-authoritative).

### Objectives (summary)

Digitize the journey; give customers clear progress/payments/docs; centralize communication; reduce manual coordination; improve management visibility; standardize workflows; add AI assistance without making AI the source of truth; structure commercial flows (packages, BOQ, quotations, procurement, execution).

---

## 2. Personas

| Role | App (typical) | Focus |
|------|----------------|--------|
| Customer | `client/` | Create/manage projects, pay, approve, track |
| Engineer / Interior Designer | `dashboard/` | Review, consult, survey, design, BOQ |
| Project Manager | `dashboard/` | Assign, schedule, escalate, monitor |
| Company Owner | `dashboard/` | Revenue, KPIs, performance |
| Administrator | `dashboard/` | Users, roles, config, catalog, audit |

**RBAC** is mandatory. Permission checks live on the **API**, not only in the UI (BRD §58).

---

## 3. Project as core entity

Each project owns (among others): requirements, rooms, preferences, drawings, AI analysis, meetings, site visits, designs, requests, BOQ, quotations, invoices, payments, procurement, warehouse movements, contract, execution, timeline, activity history.

Customer project workspace tabs (BRD §52): Overview, Timeline, Requirements, Rooms, Drawings, AI analysis, References, Meetings, Site Visits, Designs, Requests, BOQ, Quotations, Invoices, Payments, Procurement, Contract, Execution, Documents, Activity.

---

## 4. Journey and phases

### High-level journey

```text
Registration → Verification → Create Project → Property Info → Design Discovery
→ Room customization → Concept confirm → Drawing upload → CAD → AI → Review
→ Project info / budget / docs → Submit → Engineer review → Free consultation
→ Meeting minutes confirm → Site visit (paid) → Survey report → Design package (paid)
→ Design production / revisions → Design approval → BOQ service (paid) → BOQ approve
→ Quotation → Execution payment → Procurement → Warehouse → Execution
→ Progress → Final inspection → Punch list → Handover → Completed
```

### Thirteen phases

| # | Phase |
|---|--------|
| 1 | Account & Onboarding |
| 2 | Project Creation |
| 3 | Design Discovery |
| 4 | Drawing & Information Collection |
| 5 | Project Submission |
| 6 | Engineer Review & Consultation |
| 7 | Site Visit |
| 8 | Design Service |
| 9 | Design Review & Approval |
| 10 | BOQ & Commercial Process |
| 11 | Procurement |
| 12 | Execution |
| 13 | Handover |

### Fixed steps vs dynamic events (BRD §60)

- **Fixed steps:** Site Visit, Design, BOQ, Contract, Execution, …
- **Dynamic events:** reschedule, cancel, payment failed/success, revision requested, note added, version uploaded, notification sent

---

## 5. Status lifecycle (BRD §59)

Suggested explicit statuses (server-owned):

```text
Draft → Concept Selected → Drawing Uploaded → AI Processing → Customer Review
→ Submitted → Under Engineer Review → Engineer Ready → Meeting Scheduled
→ Meeting Completed → Requirements Confirmed → Site Visit Scheduled
→ Site Visit Paid → Site Visit Completed → Design Pending → Design In Progress
→ Design Delivered → Design Revision → Design Confirmed → BOQ Generated
→ BOQ Confirmed → Payment Completed → Contract Pending → Execution
→ Final Inspection → Handover → Completed
```

Transitions are controlled by **business rules**, not free client edits.

---

## 6. Money model

### Design packages (configurable)

Examples: 2D / 3D / 2D+3D. May include price, delivery time, revision allowance, dedicated PM, add-ons.

### BOQ vs Quotation (separate)

| Concept | Answers |
|---------|---------|
| **BOQ** | What materials/work items are required? |
| **Quotation** | What commercial price does the company offer? |

### Invoices

Statuses: Draft, Issued, Partially Paid, Paid, Overdue, Cancelled, Refunded.

### Payments

Statuses: Pending, Processing, Succeeded, Failed, Refunded.  
**Success is confirmed server-side** (provider verification / webhooks). Frontend is never the source of truth.

### Payment gates (must enforce on backend)

| Gate | Unlocks |
|------|---------|
| Site visit payment | Visit / assignment flow |
| Design package payment | Design work |
| BOQ payment | BOQ preparation |
| Execution payment | Execution / procurement per agreement |

Example site-visit fee discussed: 500 EGP — **configurable**, not hardcoded forever.

---

## 7. Scheduling and site visit

- Engineer availability, working hours, buffers, holidays, blocked slots
- No double booking
- Site visit statuses: Assigned → On The Way → Arrived → In Progress → Completed
- Site contact may be customer, representative, compound, security, etc.
- Survey report: measurements, photos, conditions, MEP notes, recommendations

Consultation (initial) is **free** per current BRD discussion; site visit is **paid**.

---

## 8. Design and BOQ revisions

- Designs are **versioned** (V1 → Revision n → Final); prior versions remain accessible by role
- Package defines included design revisions; extras become paid requests
- BOQ has its **own** revision allowance, independent of design

---

## 9. Procurement, warehouse, execution, handover

```text
Purchase → Receipt → Warehouse → Transfer → Site → Consumption / Installation
```

Execution: contract → planning → tasks/milestones → materials → progress.  
Handover: final inspection → punch list → resolution → final approval → handover.

---

## 10. Requests and change orders

Customer requests inside a project (modification, extra work, question, issue, …) have an independent lifecycle:

```text
Submitted → Under Review → Need More Info → Approved/Rejected → In Progress → Completed
```

Extra work may create: request → review → cost → invoice → approval → payment → task.

---

## 11. AI and data trust

### AI may assist with

Preference intelligence, drawing interpretation (from structured CAD), requirement structuring, meeting summary, design review vs requirements, BOQ suggestions, project Q&A with controlled data access.

### AI must NOT be source of truth for

Critical measurements, payments, financial totals, appointment availability, project state, contract values, final BOQ totals.

### Source types (BRD §17)

`Customer Entered` | `CAD Extracted` | `AI Inferred` | `Engineer Verified`

Precedence for critical engineering data:

```text
Engineer Verified > CAD Extracted > AI Inferred
```

Never overwrite engineer-verified data with AI output.

CAD extraction and AI interpretation are **separate** layers.

---

## 12. Business rules checklist (BRD §64)

1. A customer may have multiple projects.  
2. Every project has an independent workflow.  
3. Workflow transitions follow business rules.  
4. Certain stages require payment before proceeding.  
5. Certain stages require customer confirmation.  
6. Engineer availability controls scheduling.  
7. Confirmed slots cannot be double booked.  
8. Critical project actions are logged.  
9. AI output does not automatically become verified data.  
10. Engineer verification is required for critical drawing information.  
11. Design versions are preserved.  
12. Design revision limits may depend on package.  
13. BOQ revision limits are independent from design revisions.  
14. BOQ and quotation are separate entities.  
15. Additional customer work may generate additional charges.  
16. Payment success must be verified.  
17. Customer requests have independent lifecycles.  
18. Project status always has a current visible value.

---

## 13. Notifications (channels)

In-app, Email, SMS, WhatsApp — events such as submitted, assigned, meeting booked/reminder, site visit booked/on the way/arrived/completed, design uploaded/revision/approved, BOQ ready, payment success/fail, invoice issued, delayed, completed.

Realtime channel (when implemented): room per project `project:<id>` — see skill `realtime-sockets`.

---

## 14. Non-functional

Reliable, secure, scalable, responsive, mobile-friendly, maintainable, auditable, role-aware, data-driven, integration-ready. Customer UX stays simple despite workflow complexity.

**No multi-tenant model** on this server (single company platform).

---

## 15. Glossary

| Term | Meaning |
|------|---------|
| Project | Primary business entity; independent workflow unit |
| BOQ | Bill of Quantities — materials/work items |
| Quotation | Commercial price offer |
| Payment gate | Server-enforced unlock after verified payment |
| Data trust | Provenance of a field value (customer/CAD/AI/engineer) |
| Punch list | Final inspection issues to resolve before handover |
| Fixed step | Workflow stage |
| Dynamic event | Action inside a stage |

---

## 16. Success criteria (short)

Customer can run multiple projects through the defined journey; staff roles can operate; payments verify; scheduling does not conflict; designs version; BOQ ≠ quotation; procurement is traceable; progress is visible; actions are auditable; AI assists without owning truth.
