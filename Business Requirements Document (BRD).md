# Business Requirements Document (BRD)

## Interior Design & Fit-Out Management Platform

**Document Type:** Business Requirements Document  
**Product:** Interior Design & Fit-Out Platform  
**Version:** 1.0  
**Status:** Draft for Business Review

---

# 1. Executive Summary

The proposed platform is a complete digital platform for an Interior Design and Fit-Out company.

The platform manages the customer's journey from the initial project request and design preference selection through drawing submission, engineer consultation, site survey, design production, Bill of Quantities (BOQ), quotation, procurement, warehouse management, execution, progress tracking, and final handover.

The platform also provides dedicated workspaces for Engineers, Project Managers, Company Owners, and Administrators.

The system is designed around the **Project** as the primary business entity. A customer can own multiple projects simultaneously, with each project having an independent workflow, financial records, requirements, documents, appointments, designs, requests, BOQ, procurement records, and execution status.

The platform combines:

**Customer Experience + Project Management + Interior Design Operations + Commercial Management + Procurement + Execution Tracking + AI Assistance**

The core business workflow documented in the project materials follows a sequential journey, while dynamic events such as rescheduling, cancellation, revisions, payment failures, notifications, and additional requests may occur within individual stages.

---

# 2. Business Objectives

The platform aims to:

1. Digitize the complete interior design and fit-out customer journey.
2. Provide customers with a clear view of project progress, requirements, payments, documents, and upcoming actions.
3. Centralize project communication and information.
4. Reduce manual coordination between customers, engineers, and managers.
5. Improve project visibility for management.
6. Standardize internal project workflows.
7. Introduce AI-assisted drawing and project intelligence.
8. Create structured commercial workflows around design packages, BOQ, quotations, procurement, and execution.
9. Improve customer transparency around payments, materials, and project progress.
10. Create a scalable digital foundation for future company growth.

---

# 3. Product Scope

The platform covers the following major business domains:

- Customer management
- Project management
- Design preference management
- Room/space configuration
- Drawing management
- CAD/DWG processing
- AI-assisted analysis
- Engineer workflow
- Online consultation
- Scheduling
- Site visits
- Design packages
- Design production
- Design revisions
- BOQ
- Quotations
- Invoices
- Payments
- Procurement
- Warehouse / inventory visibility
- Project requests
- Contract management
- Execution tracking
- Notifications
- Analytics
- Audit and activity tracking

---

# 4. Key User Roles

## 4.1 Customer

The Customer is the project owner and initiates and manages projects through the platform.

Primary responsibilities:

- Create projects
- Define project requirements
- Select design preferences
- Upload drawings
- Review extracted information
- Book consultations
- Confirm requirements
- Book site visits
- Pay for services
- Review designs
- Request revisions
- Approve designs
- Review BOQ
- Review quotations
- Track procurement
- Track project progress
- Submit requests
- Review project finances
- Confirm milestones
- Complete handover

---

## 4.2 Engineer / Interior Designer

The Engineer is responsible for the technical and design side of the project.

Responsibilities include:

- Reviewing customer requirements
- Reviewing drawings
- Verifying extracted information
- Conducting consultations
- Performing site surveys
- Recording measurements
- Uploading site photos
- Preparing site reports
- Preparing designs
- Handling revisions
- Preparing BOQ
- Updating project progress

---

## 4.3 Project Manager

The Project Manager controls the operational side of projects.

Responsibilities:

- Assign engineers
- Manage schedules
- Monitor project progress
- Monitor deadlines
- Manage customer requests
- Monitor engineer workload
- Handle escalations
- Manage operational issues
- Monitor payments and pending actions
- Monitor project delays

---

## 4.4 Company Owner

The Company Owner focuses on business-level performance.

Responsibilities:

- Monitor revenue
- Monitor project performance
- Monitor profitability where cost data is available
- Monitor engineer performance
- Monitor service performance
- Monitor customer trends
- Review operational KPIs

---

## 4.5 Administrator

The Administrator manages the platform and its configuration.

Responsibilities include:

- User management
- Roles and permissions
- Services
- Design styles
- Gallery
- Design packages
- Materials
- Pricing
- Payment configuration
- Notification configuration
- Platform settings
- Audit logs

---

# 5. Core Business Concept: Project

The **Project** is the core entity of the platform.

A single customer can have multiple projects.

Example:

Customer:
Ahmed

Projects:

- Apartment – New Cairo
- Villa – North Coast
- Shop – Cairo

Each project operates independently.

Each project has its own:

- Requirements
- Rooms
- Preferences
- Drawings
- AI analysis
- Meetings
- Site visits
- Designs
- Requests
- BOQ
- Quotations
- Invoices
- Payments
- Procurement
- Warehouse movements
- Contract
- Execution
- Timeline
- Activity history

The meeting materials explicitly establish that customers can have multiple projects and that every project has an independent workflow.

---

# 6. Customer Journey

The complete customer journey is:

```text
Registration
↓
Verification
↓
Create Project
↓
Property Information
↓
Design Style Discovery
↓
Style / Reference Selection
↓
Room-by-Room Customization
↓
Concept Review
↓
Concept Confirmation
↓
Drawing Upload
↓
CAD Processing
↓
AI Interpretation
↓
Customer Review
↓
Manual Correction if Needed
↓
Project Information
↓
Budget
↓
Target Completion Date
↓
Property Documents
↓
Additional Requirements
↓
Final Review
↓
Project Submission
↓
Engineer Review
↓
Free Consultation
↓
Meeting
↓
Meeting Minutes
↓
Customer Confirmation
↓
Site Visit Booking
↓
Site Visit Payment
↓
Manager Assignment
↓
Engineer Assigned
↓
Engineer On The Way
↓
Engineer Arrived
↓
Site Survey
↓
Site Survey Report
↓
Report Review / Approval
↓
Design Package Selection
↓
Design Payment
↓
Design Production
↓
Design Delivery
↓
Customer Review
↓
Revision Cycle
↓
Final Design Approval
↓
BOQ Service Selection
↓
BOQ Payment
↓
BOQ Preparation
↓
BOQ Review
↓
BOQ Revision
↓
BOQ Approval
↓
Execution Quotation
↓
Customer Confirmation
↓
Execution Payment
↓
Procurement
↓
Warehouse
↓
Material Transfer to Site
↓
Execution
↓
Progress Tracking
↓
Final Inspection
↓
Punch List
↓
Issue Resolution
↓
Final Approval
↓
Handover
↓
Completed
```

The first part of this journey and the design, BOQ, contract, and execution stages are supported directly by the meeting notes.

---

# 7. Business Phases

The business workflow is organized into the following phases.

## Phase 1: Account & Onboarding

Customer creates and verifies the account.

## Phase 2: Project Creation

Customer defines the property and project type.

## Phase 3: Design Discovery

Customer explores styles, references, and room preferences.

## Phase 4: Drawing & Information Collection

Customer uploads drawings and the system processes available information.

## Phase 5: Project Submission

Customer confirms information and submits the project.

## Phase 6: Engineer Review & Consultation

Engineer reviews the project and conducts the free consultation.

## Phase 7: Site Visit

Customer schedules and pays for the survey, and the company performs the site visit.

## Phase 8: Design Service

Customer selects and pays for a design package.

## Phase 9: Design Review & Approval

Customer reviews the design and may request revisions.

## Phase 10: BOQ & Commercial Process

BOQ is prepared, reviewed, and followed by quotation.

## Phase 11: Procurement

Approved materials are purchased and tracked.

## Phase 12: Execution

The project enters implementation and progress tracking.

## Phase 13: Handover

The company completes final inspection and hands over the project.

---

# 8. Property Information Requirements

The project setup must allow the customer to provide:

- Project name
- Property type
- Governorate
- City
- Compound / development
- Property area
- Number of floors
- Property status
- Finishing status
- Accessibility information
- Customer country of residence
- Local representative if required
- Local representative phone
- Property documents
- Existing property files

Example property statuses may include:

- Fully Finished
- Semi Finished
- Core & Shell
- Under Construction
- Occupied
- Other

The exact available values must be configurable.

---

# 9. Budget Requirements

The customer may provide:

- Budget range
- Exact budget
- Undecided / not specified

Budget is optional.

The platform must not prevent submission simply because the customer has not decided on a budget.

---

# 10. Target Completion Requirements

The customer may specify:

- Target date
- Desired duration
- No specific deadline

The system should store the target and later compare it against actual project duration.

---

# 11. Design Discovery

The platform should provide a visual Design Style Gallery.

The customer can:

- Browse
- Search
- Filter
- View style details
- Select styles
- Select specific reference images

Styles are configurable.

Examples:

- Modern
- Classic
- Islamic
- Scandinavian
- Minimal
- Contemporary
- Luxury
- Industrial

---

# 12. Space-Level Design Preferences

The customer may define different preferences for different spaces.

Example:

```text
Living Room → Classic
Kitchen → Modern
Master Bedroom → Islamic
Balcony → Scandinavian
```

A project therefore supports:

**Overall Project Style**

plus

**Space-Level Style Preferences**

and

**Reference Images per Space**

---

# 13. Concept Confirmation

Before proceeding to detailed project submission, the customer reviews:

- Selected overall style
- Selected room styles
- Reference images
- Main preferences

The customer confirms the concept.

The confirmed concept becomes part of the project baseline.

---

# 14. Drawing Management

The platform must support drawing/document uploads.

Potential file types:

- DWG
- DXF
- PDF
- Images
- Other supported documents

The platform must track:

- File
- Project
- Owner
- Type
- Version
- Processing status
- Analysis status
- Upload date
- Errors

---

# 15. CAD / Drawing Analysis

The platform must separate CAD extraction from AI interpretation.

Expected process:

```text
Drawing
↓
CAD Processing
↓
Geometry
↓
Metadata
↓
Normalization
↓
Structured CAD Data
↓
AI Interpretation
↓
Customer Review
↓
Engineer Verification
```

The CAD processing layer is responsible for geometric information.

The AI layer is responsible for semantic interpretation.

The engineer is responsible for final engineering verification.

The meeting notes explicitly describe this model: Drawing → CAD/Drawing Engine → Structured Geometry → AI Interpretation → Extracted Information → Engineer Verification.

---

# 16. AI Requirements

The AI layer should support:

### Preference Intelligence

Interpret customer style and preference selections.

### Drawing Interpretation

Interpret structured CAD output.

### Requirement Structuring

Turn free-text requirements into structured requirements.

### Meeting Summary

Summarize discussions and generate structured actions.

### Design Review

Compare current designs against approved requirements.

### BOQ Assistance

Assist with suggested materials, categorization, and quantity extraction where reliable structured data exists.

### Project Assistant

Answer project questions using controlled access to real project data.

AI must not be the source of truth for:

- Critical measurements
- Payments
- Financial totals
- Appointment availability
- Project state
- Contract values
- Final BOQ totals

---

# 17. Data Trust Model

Important information should identify its source.

Supported source types:

- Customer Entered
- CAD Extracted
- AI Inferred
- Engineer Verified

Critical engineering information should prefer:

```text
Engineer Verified
>
CAD Extracted
>
AI Inferred
```

The system must not automatically overwrite engineer-verified data with AI-generated data.

---

# 18. Engineer Review

After project submission:

```text
Submitted
↓
Under Engineer Review
↓
Engineer Ready
```

The Engineer should review:

- Customer profile
- Property information
- Style preferences
- Room requirements
- References
- Drawings
- CAD analysis
- Project notes
- Budget
- Target timeline

The engineer may:

- Approve information
- Correct information
- Add notes
- Request clarification
- Mark the project ready for consultation

The documented workflow includes these review stages.

---

# 19. Consultation

The initial consultation is a free service according to the current project discussion.

The customer:

- Views available slots
- Selects a time
- Receives confirmation
- Attends the meeting

The system records:

- Date
- Time
- Engineer
- Meeting provider
- Status
- Link

---

# 20. Meeting Minutes

After consultation, the engineer records:

- Discussion
- Requirements
- Decisions
- Concerns
- Action items
- Notes

The customer reviews the meeting minutes.

The customer may:

- Add concerns
- Request changes
- Confirm

After confirmation, the approved requirements become the baseline for the next stages.

The meeting notes explicitly define the meeting minutes and customer confirmation steps.

---

# 21. Site Visit

The site visit is a paid service.

The current discussed example is a fee of 500 EGP, but the actual fee must be configurable by the company.

Flow:

```text
Book Site Visit
↓
Choose Slot
↓
Pay
↓
Payment Verification
↓
Manager Assigns Engineer
↓
Engineer Notification
↓
Visit
```

---

# 22. Site Contact

The customer may not be physically present.

The site visit may instead involve:

- Customer
- Customer representative
- Compound representative
- Security
- Other authorized contact

The system must therefore support:

- Contact name
- Contact phone
- Relationship / role
- Visit notes

---

# 23. Site Visit Tracking

The site visit should support status events such as:

```text
Assigned
↓
On The Way
↓
Arrived
↓
In Progress
↓
Completed
```

The current desired experience includes customer notifications similar to a delivery/travel tracking experience.

Real-time GPS can be implemented where appropriate; otherwise the system can initially rely on explicit engineer status updates.

---

# 24. Site Survey Report

The engineer records:

- Measurements
- Photos
- Videos where applicable
- Existing conditions
- Electrical observations
- Plumbing observations
- Site issues
- Notes
- Recommendations

The customer should be able to see the approved report and available site documentation.

The meeting material explicitly describes the engineer uploading site measurements, observations, and a large collection of site photos.

---

# 25. Design Packages

Design services are configurable.

Current examples:

### 2D Design

### 3D Design

### 2D + 3D Design

A package may include:

- Services
- Price
- Delivery time
- Revision allowance
- Terms
- Dedicated Project Manager
- Other add-ons

The package must be manageable by Admin.

---

# 26. Dedicated Project Manager

A package may include:

**Dedicated Project Manager**

This means project-management service can be packaged as part of the commercial offering.

The system should therefore support configurable package features/add-ons.

---

# 27. Design Payment

Design service workflow:

```text
Select Package
↓
Review Details
↓
Review Terms
↓
Confirm
↓
Payment
↓
Payment Verification
↓
Design Work Activated
```

The engineer should not receive an active paid design task until the payment requirement has been successfully verified.

---

# 28. Design Production

The design may progress through multiple internal stages.

Examples:

- Space Planning
- Concept Development
- Design Development
- Finalization

Each stage may have its own estimated duration.

The platform should support stage-based project progress.

---

# 29. Design Versioning

Designs must be versioned.

Example:

```text
Design V1
↓
Revision 1
↓
Revision 2
↓
Final
```

Previous versions should remain accessible according to role permissions.

---

# 30. Revision Policy

Each design package may define its own revision allowance.

Example:

```text
Included revisions = 2
```

Then:

```text
V1
↓
Revision 1
↓
Revision 2
↓
Revision 3 = Paid
```

Additional revisions should become a separate paid request/order when required.

---

# 31. BOQ Service

BOQ is a distinct paid service.

The customer may decide whether they want the company to prepare the BOQ.

Flow:

```text
Design Confirmed
↓
BOQ Service Offer
↓
Customer Accepts
↓
Payment
↓
BOQ Preparation
↓
BOQ Delivery
```

The exact BOQ service price must be configurable.

---

# 32. BOQ Content

The BOQ may contain:

- Category
- Material
- Item
- Description
- Quantity
- Unit
- Unit Price
- Labor
- Waste
- Discount
- Tax
- Total

Examples:

```text
Marble
84 m²

LED Spotlights
42 pcs

Kitchen Cabinets
8.4 m
```

---

# 33. BOQ Revision Policy

BOQ may have its own revision allowance.

This must be independent from design revisions.

Example:

```text
BOQ revisions = 2
```

Any additional revision can become a paid request.

---

# 34. BOQ vs Quotation

The platform must treat these as two separate concepts.

### BOQ

Answers:

**What materials/work items are required?**

### Quotation

Answers:

**What is the commercial price offered by the company?**

They are separate entities and separate business processes.

---

# 35. Quotation

After BOQ approval:

```text
BOQ Approved
↓
Quotation Generated
↓
Customer Reviews
↓
Customer Confirms
↓
Payment
```

The quotation may include:

- Material costs
- Labor
- Services
- Logistics
- Other costs
- Discounts
- Taxes
- Total value
- Terms

---

# 36. Procurement

After required payment:

```text
Quotation Approved
↓
Payment Completed
↓
Procurement
↓
Materials Purchased
↓
Materials Received
↓
Warehouse
↓
Site
```

Procurement should track:

- Material
- Quantity
- Supplier
- Purchase status
- Receiving status
- Warehouse location
- Site transfer
- Project

---

# 37. Warehouse

The company may have:

- Main warehouse
- Project warehouse
- Site storage
- Other storage locations

The platform should support stock visibility.

Example:

```text
Marble
84 m²
Purchased
Received
In Warehouse
Transferred to Site
Installed
```

The customer should see the appropriate customer-facing procurement status.

---

# 38. Inventory / Stock Movement

The system should support:

```text
Purchase
↓
Receipt
↓
Warehouse
↓
Transfer
↓
Site
↓
Consumption / Installation
```

The system must maintain traceability for material movement.

---

# 39. Execution

After commercial approval and contract completion:

```text
Contract
↓
Execution Planning
↓
Tasks
↓
Milestones
↓
Material Availability
↓
Execution
↓
Progress
```

Project Managers monitor execution status.

---

# 40. Progress Tracking

The system should provide:

- Overall completion percentage
- Current phase
- Current step
- Completed milestones
- Pending tasks
- Upcoming tasks
- Delays
- Responsible staff

Example:

```text
Design       100%
BOQ          100%
Contract     100%
Execution     35%
```

---

# 41. Final Inspection

At project completion:

```text
Execution Complete
↓
Final Inspection
↓
Punch List
↓
Issue Resolution
↓
Final Approval
↓
Handover
```

The punch list may include:

- Issue
- Location
- Photo
- Responsible person
- Priority
- Resolution status
- Completion date

---

# 42. Project Requests

The Customer can create multiple requests inside an existing project.

Examples:

- Design Modification
- Additional Service
- Question
- Issue
- Extra Work
- Document Request
- Change Request

Each Request has its own status and activity history.

---

# 43. Request Lifecycle

Suggested:

```text
Submitted
↓
Under Review
↓
Need More Information
↓
Approved / Rejected
↓
In Progress
↓
Completed
```

A request should not automatically alter the main project state unless a business rule explicitly requires it.

---

# 44. Change Orders

Additional work may create:

```text
Customer Request
↓
Manager Review
↓
Additional Cost
↓
Invoice
↓
Customer Approval
↓
Payment
↓
Task
```

This provides a formal mechanism for out-of-scope work.

---

# 45. Financial Model

Financial information must be tracked at multiple levels.

## Customer Payments

What the customer paid.

## Project Costs

Costs associated with the project.

## Procurement Costs

Costs of materials purchased.

## Quotation

Price offered to the customer.

## Revenue

Money received by the company.

---

# 46. Invoices

Invoices must support:

- Draft
- Issued
- Partially Paid
- Paid
- Overdue
- Cancelled
- Refunded

Invoice items must be traceable to services or commercial transactions.

---

# 47. Payments

Payment statuses:

- Pending
- Processing
- Succeeded
- Failed
- Refunded

Payment success must be confirmed server-side through payment provider verification/webhooks.

The frontend must never be the source of truth for payment completion.

---

# 48. Payment Gates

Some stages require successful payment before the next action becomes available.

Examples:

### Site Visit

Payment → Visit activated.

### Design Package

Payment → Design work activated.

### BOQ

Payment → BOQ work activated.

### Execution

Payment → Execution/procurement activated according to commercial agreement.

Payment gates must be enforced by the backend.

---

# 49. Scheduling

Scheduling must support:

- Engineer availability
- Working hours
- Site visits
- Consultation meetings
- Duration
- Buffer times
- Holidays
- Blocked slots
- Rescheduling
- Cancellation
- No-show

The system must prevent double booking.

The source notes explicitly establish that engineer availability controls booking and booked slots become unavailable.

---

# 50. Notifications

Supported channels:

- In-app
- Email
- SMS
- WhatsApp

Events may include:

- Project submitted
- Engineer assigned
- Engineer ready
- Meeting booked
- Meeting reminder
- Site visit booked
- Engineer on the way
- Engineer arrived
- Site visit completed
- Design uploaded
- Revision requested
- Design approved
- BOQ ready
- Payment successful
- Payment failed
- Invoice issued
- Payment due
- Project delayed
- Project completed

---

# 51. Customer Dashboard

The Customer Dashboard should provide:

## Overview

- Total projects
- Active projects
- Completed projects
- Total paid
- Outstanding amount
- Upcoming appointments
- Pending actions

## Project Cards

Each project displays:

- Name
- Property type
- Current stage
- Current status
- Progress
- Next action

---

# 52. Project Workspace

The customer should have access to:

- Overview
- Timeline
- Requirements
- Rooms
- Drawings
- AI analysis
- References
- Meetings
- Site Visits
- Designs
- Requests
- BOQ
- Quotations
- Invoices
- Payments
- Procurement
- Contract
- Execution
- Documents
- Activity

---

# 53. Customer Financial Dashboard

The customer must be able to see:

- Total project value
- Paid amount
- Outstanding amount
- Upcoming payment
- Payment history
- Invoices
- Receipts
- Applicable project expenses/visibility

The UI should clearly distinguish paid amounts from amounts still due.

---

# 54. Engineer Dashboard

Engineer dashboard should include:

- Assigned projects
- Pending reviews
- Calendar
- Meetings
- Site visits
- Design tasks
- Revision requests
- BOQ tasks
- Requests
- Overdue work
- Notifications

---

# 55. Project Manager Dashboard

Manager dashboard should include:

- Total active projects
- Unassigned projects
- Delayed projects
- At-risk projects
- Engineer workload
- Upcoming meetings
- Upcoming site visits
- Pending customer actions
- Pending requests
- Pending payments
- Project completion rates

---

# 56. Owner Dashboard

Owner dashboard should provide:

- Revenue
- Monthly revenue
- Active projects
- Completed projects
- Average project value
- Project duration
- Project status distribution
- Engineer performance
- Service performance
- Customer statistics
- Popular styles
- Outstanding payments
- Profitability where sufficient data exists

---

# 57. Admin Panel

Admin manages:

- Users
- Roles
- Permissions
- Engineers
- Managers
- Services
- Styles
- Gallery
- Design Packages
- Add-ons
- Materials
- Suppliers
- Pricing
- Payments
- Notifications
- System Settings
- Audit Logs

---

# 58. Role-Based Access Control

The platform must implement RBAC.

Each role has:

- Dashboard
- Navigation
- Permissions
- Actions
- Data visibility

Permission checks must exist at the backend/API level, not only in the frontend.

---

# 59. Project Status Management

Project status must be explicit.

Suggested lifecycle:

```text
Draft
↓
Concept Selected
↓
Drawing Uploaded
↓
AI Processing
↓
Customer Review
↓
Submitted
↓
Under Engineer Review
↓
Engineer Ready
↓
Meeting Scheduled
↓
Meeting Completed
↓
Requirements Confirmed
↓
Site Visit Scheduled
↓
Site Visit Paid
↓
Site Visit Completed
↓
Design Pending
↓
Design In Progress
↓
Design Delivered
↓
Design Revision
↓
Design Confirmed
↓
BOQ Generated
↓
BOQ Confirmed
↓
Payment Completed
↓
Contract Pending
↓
Execution
↓
Final Inspection
↓
Handover
↓
Completed
```

The source material emphasizes explicit project statuses and server-side control of workflow transitions.

---

# 60. Phase vs Event

The platform must distinguish:

### Fixed Steps

Business workflow stages that define progression.

Examples:

- Site Visit
- Design
- BOQ
- Contract
- Execution

### Dynamic Events

Actions occurring within steps.

Examples:

- Reschedule
- Cancellation
- Payment failed
- Payment successful
- Revision requested
- Engineer note added
- Design version uploaded
- Notification sent

This distinction is essential to the workflow design.

---

# 61. Activity History

Every project should have a visible timeline.

Examples:

```text
Project Created
Concept Confirmed
Drawing Uploaded
Engineer Assigned
Meeting Scheduled
Requirements Confirmed
Site Visit Completed
Design V1 Uploaded
Revision Requested
Design Approved
BOQ Approved
Payment Completed
Contract Signed
Execution Started
```

---

# 62. Audit Log

The platform must separately maintain an audit log for internal traceability.

Store:

- Actor
- Action
- Entity
- Entity ID
- Timestamp
- Previous value
- New value
- Metadata

This is separate from the simplified customer activity timeline.

---

# 63. Reporting & Analytics

The platform should support analytics by:

- Customer
- Project
- Engineer
- Manager
- Service
- Style
- Project Type
- Revenue
- Payment
- Duration
- Delay
- Procurement
- Completion

Analytics should always use actual application data.

---

# 64. Business Rules

## Rule 1

A customer may have multiple projects.

## Rule 2

Every project has an independent workflow.

## Rule 3

Project workflow transitions are controlled by business rules.

## Rule 4

Certain stages require payment before proceeding.

## Rule 5

Certain stages require customer confirmation.

## Rule 6

Engineer availability controls scheduling.

## Rule 7

Confirmed time slots cannot be double booked.

## Rule 8

Critical project actions are logged.

## Rule 9

AI output does not automatically become verified data.

## Rule 10

Engineer verification is required for critical drawing information.

## Rule 11

Design versions are preserved.

## Rule 12

Design revision limits may depend on package.

## Rule 13

BOQ revision limits are independent from design revisions.

## Rule 14

BOQ and quotation are separate business entities.

## Rule 15

Additional customer work may generate additional charges.

## Rule 16

Payment success must be verified.

## Rule 17

Customer requests have independent lifecycle management.

## Rule 18

Project status must always have a current visible value.

These principles align with the documented business rules from the project notes.

---

# 65. Non-Functional Business Requirements

The system should be:

- Reliable
- Secure
- Scalable
- Responsive
- Mobile-friendly
- Maintainable
- Auditable
- Role-aware
- Data-driven
- Integration-ready

The customer experience should be simple despite the complexity of the underlying workflow.

---

# 66. Data and Information Requirements

The platform should treat information in categories:

### Customer Data

Profile and contact information.

### Property Data

Unit, location, condition, and property characteristics.

### Project Data

Workflow and commercial information.

### Technical Data

Drawings, dimensions, site measurements, designs.

### Commercial Data

Packages, invoices, payments, BOQ, quotations.

### Operational Data

Tasks, milestones, appointments, requests, progress.

### Procurement Data

Materials, suppliers, purchase orders, warehouse movements.

### Audit Data

Activities and system history.

---

# 67. Future Expansion

The product should be designed so future modules can be added, including:

- Sales CRM
- Finance module
- Supplier portal
- Site Supervisor role
- Advanced inventory
- Procurement management
- WhatsApp integration
- Customer support
- Advanced AI project assistant
- Advanced design intelligence
- Advanced execution management

These are future expansion areas and are not mandatory for the initial business release.

---

# 68. Success Criteria

The platform will be considered successful when:

1. A customer can create multiple projects.
2. A customer can complete the full defined journey.
3. Engineers can receive and work on assigned projects.
4. Project Managers can control operational workflow.
5. Owners can view meaningful business analytics.
6. Admins can manage system configuration.
7. Payments can be processed and verified.
8. Scheduling prevents conflicts.
9. Designs are versioned.
10. BOQ and quotation workflows are separated.
11. Procurement is traceable.
12. Project progress is visible.
13. Critical actions are auditable.
14. AI assists without becoming the source of truth.
15. The company can manage a project from initial request through handover using one platform.

---

# 69. High-Level Business Workflow

```text
CUSTOMER
   │
   ▼
PROJECT CREATION
   │
   ▼
DESIGN VISION
   │
   ▼
DRAWING + PROPERTY DATA
   │
   ▼
AI / CAD ANALYSIS
   │
   ▼
ENGINEER REVIEW
   │
   ▼
CONSULTATION
   │
   ▼
REQUIREMENT CONFIRMATION
   │
   ▼
SITE VISIT
   │
   ▼
DESIGN SERVICE
   │
   ▼
DESIGN APPROVAL
   │
   ▼
BOQ
   │
   ▼
QUOTATION
   │
   ▼
PROCUREMENT
   │
   ▼
WAREHOUSE
   │
   ▼
EXECUTION
   │
   ▼
INSPECTION
   │
   ▼
HANDOVER
```

---

# 70. Final Product Definition

The product is a unified system that transforms a traditionally fragmented interior design and fit-out process into a structured digital workflow.

Instead of relying on disconnected:

- WhatsApp conversations
- Emails
- Files
- Spreadsheets
- Phone calls
- Manual scheduling
- Manual payment follow-up
- Separate project tracking

the company uses one platform as the central source for:

**Customers + Projects + Engineers + Managers + Design + Payments + Procurement + Execution**

The final platform should provide a transparent and controlled journey from:

**"I want to design my property"**

to:

**"My property has been designed, procured, executed, inspected, and handed over."**