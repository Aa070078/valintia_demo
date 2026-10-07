# Valentia — Full-Stack Integration & Developer Guide
**Design & Build Atelier Platform**

This guide provides the backend and frontend engineering teams with complete instructions to run, visually test, and extend features across the **Server (NestJS)**, **Client (Next.js 16)**, and **Dashboard (Next.js 16)** applications.

---

## 1. Monorepo Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │             NestJS Shared API                │
                      │           (http://localhost:5000)            │
                      │  • JWT Auth & RBAC (Customer, Engineer, PM)  │
                      │  • Prisma 7 + PostgreSQL 16                  │
                      │  • Email OTP / Gmail SMTP                    │
                      │  • Swagger Docs: /docs                       │
                      └───────────────▲──────────────▲───────────────┘
                                      │              │
                   REST JSON / Cookies│              │REST JSON / JWT
                                      │              │
        ┌─────────────────────────────┴────┐    ┌────┴─────────────────────────────┐
        │       Client Application         │    │      Dashboard Application       │
        │     (http://localhost:3000)      │    │     (http://localhost:3001)      │
        │  • Luxury Customer Intake & 3D   │    │  • Engineer Review Workspace     │
        │  • Real-time Notification Center │    │  • PM Multi-Engineer Assignment  │
        │  • Consultation Meeting Booking  │    │  • Admin Analytics & Email Logs  │
        │  • Project Journey & Specs       │    │  • Minutes of Meeting (MOM)      │
        └──────────────────────────────────┘    └──────────────────────────────────┘
```

---

## 2. Quick Start: Running the Full Stack Locally

### Step 1: Backend Setup (`server/`)
```bash
cd server

# 1. Install dependencies
npm install

# 2. Ensure PostgreSQL & Redis are running (or use Docker)
npm run docker:up

# 3. Generate Prisma client & apply migrations
npm run prisma:generate
npm run prisma:migrate:dev

# 4. Seed development users (creates test customer, engineer, pm, admin)
npm run prisma:seed

# 5. Start NestJS in watch mode (Port 5000)
npm run start:dev
```
- **API URL:** `http://localhost:5000/api`
- **Swagger Documentation:** `http://localhost:5000/docs`
- **Health Check:** `http://localhost:5000/api/health`

### Step 2: Customer Client Setup (`client/`)
```bash
cd client
npm install
npm run dev
```
- Runs on **`http://localhost:3000`**
- Directly communicates with `http://localhost:5000/api` (ensure `NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false`).

### Step 3: Admin & Staff Dashboard Setup (`dashboard/`)
```bash
cd dashboard
npm install
npm run dev
```
- Runs on **`http://localhost:3001`**

---

## 3. Pre-Seeded Test Credentials

On the login page (`http://localhost:3000/login` or `http://localhost:3001/login`), you can use the **One-Click Quick Login Buttons** or the following credentials:

| Role | Username / Email | Password | Primary Workspace Route |
|------|-------------------|----------|-------------------------|
| **Customer** | `customer1@test.com` | `Customer123!` | `/projects` |
| **Engineer** | `engineer1@test.com` | `Engineer123!` | `/dashboard/engineer` or `/engineer` |
| **Project Manager** | `pm@test.com` | `ProjectManager123!` | `/dashboard/pm` or `/pm` |
| **Administrator** | `admin@test.com` | `Admin123!` | `/dashboard/admin` or `/admin` |
| **Company Owner** | `owner@test.com` | `Owner123!` | `/owner` |

---

## 4. Visual End-to-End Testing Workflows

### Workflow A: Customer Project Intake & Instant Submit
1. Log in as **Customer** (`customer1@test.com`).
2. Go to **`http://localhost:3000/projects/new`**.
3. Fill out the 6-step Atelier intake flow:
   - **01 Welcome**: Click Start.
   - **02 Property**: Select Volume / Property Type (e.g., Villa, Townhouse).
   - **03 Spaces**: Choose rooms and quantities.
   - **04 Style & Mood**: Select architectural materials and aesthetic.
   - **05 Design Brief**: Enter location and notes.
   - **06 Review & Submit**: Click **"تأكيد وتقديم طلب المشروع مباشرة"**.
4. The project is created and automatically transitions to **`SUBMITTED`** on the backend.
5. The customer is redirected to `/projects/[id]` where Stage 02 is locked with `في انتظار اعتماد المهندس ⏳`.

---

### Workflow B: Engineer Review & Consultation Readiness
1. Log in as **Engineer** (`engineer1@test.com`).
2. Navigate to **`http://localhost:3000/dashboard/engineer`**.
3. In the section **"طابور مراجعة المشاريع واعتماد الجاهزية للميتينج"**, locate the submitted project.
4. Click **"بدء المراجعة الفنية"**:
   - Optional: Enter engineer feedback note.
   - Click Confirm -> Triggers `POST /api/projects/:id/review/start`.
   - Project status moves to **`UNDER_ENGINEER_REVIEW`**.
   - Backend dispatches an email notification to the customer via `MailService`.
5. Click **"اعتماد وجاهز للميتينج ←"**:
   - Optional: Enter consultation instructions note.
   - Click Confirm -> Triggers `POST /api/projects/:id/review/ready-for-consultation`.
   - Project status moves to **`ENGINEER_READY`**.
   - Backend logs the review approval and dispatches a notification email.

---

### Workflow C: Customer Meeting Booking & Notification Center
1. Switch back to **Customer** (`customer1@test.com`) on **`http://localhost:3000/projects/[id]`**.
2. **Notification Center:**
   - The bell in the header rings with an unread badge (`1`).
   - A floating toast pops up: *"المهندس مستعد لمقابلتك! احجز ميعادك الآن 🎉"*.
3. **Stage 02 Scheduler Unlocked:**
   - Button illuminates: **"اختيار وقت الميتينج الآن ←"**.
   - Clicking opens the 21st Calendar component.
   - Customer chooses an available date and time slot.
   - Status updates to **`CONSULTATION_SCHEDULED`** with Google Meet details.
   - Note explicitly states that Stage 03 (Site Visit) unlocks only after the consultation.

---

### Workflow D: Project Manager Multi-Engineer Assignment
1. Log in as **Project Manager** (`pm@test.com`).
2. Navigate to **`http://localhost:3000/dashboard/pm`** (or `http://localhost:3001/pm`).
3. View unassigned incoming projects.
4. Click **"تعيين الفريق الهندسي للمشروع"** to assign responsible engineers to the project portfolio.

---

### Workflow E: Staff First-Time Onboarding
1. When an administrator provisions an internal staff user (Engineer, PM, or Owner) with temporary credentials.
2. The user signs in for the first time.
3. System prompts for permanent email address.
4. User receives 6-digit OTP code in their email inbox.
5. User enters OTP -> sets new permanent password.
6. User's `mustChangePassword` is resolved and account is fully verified.

---

## 5. How to Add or Modify Backend APIs with the Frontend

When creating a new feature or adding fields, follow this 4-step contract pattern:

### Step 1: Define / Update Backend DTO & Controller (`server/`)
```typescript
// server/src/projects/dto/update-consultation-notes.dto.ts
import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConsultationNotesDto {
  @ApiProperty({ description: 'Meeting agenda or prep notes', example: 'Discuss master bedroom layout' })
  @IsString()
  @MinLength(5)
  notes: string;
}
```

```typescript
// server/src/projects/projects.controller.ts
@Patch(':id/consultation-notes')
@Roles(Role.ENGINEER, Role.PROJECT_MANAGER)
@ApiOperation({ summary: 'Update consultation notes' })
async updateConsultationNotes(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateConsultationNotesDto,
  @CurrentUser() user: RequestUser,
) {
  return this.projectsService.updateConsultationNotes(id, dto, user);
}
```

### Step 2: Update Frontend API Client (`client/` or `dashboard/`)
In `client/lib/api/admin-api.ts` or `client/lib/api/projects.ts`:

```typescript
export async function updateConsultationNotes(
  projectId: number,
  notes: string,
): Promise<{ success: boolean }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/consultation-notes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ notes }),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Failed to update consultation notes');
  }

  return res.json();
}
```

### Step 3: Trigger Live UI Reactivity
If the change alters project status or needs to alert other open tabs/components, dispatch the standard Valentia event:

```typescript
// Dispatches event to update timeline, notification centers, and state badges instantly
window.dispatchEvent(
  new CustomEvent('valentia:project-status-change', {
    detail: { projectId, status: 'UPDATED_STATUS' },
  }),
);
```

### Step 4: Quality Gate Verification
Always execute before committing:
```bash
# In server/
npm run build

# In client/
npm run typecheck
npm run build

# In dashboard/
npm run typecheck
npm run build
```

---

## 6. Environment Variables Reference

### `server/.env`
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fitout_db?schema=public"
JWT_SECRET="dev_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"
REDIS_HOST="localhost"
REDIS_PORT=6379

# Nodemailer / Gmail SMTP for live OTP and notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="notifications@valentia.example"
SMTP_PASS="app_specific_password"
SMTP_FROM="Valentia Atelier <notifications@valentia.example>"
```

### `client/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENABLE_MOCK_FALLBACK=false
```

### `dashboard/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
