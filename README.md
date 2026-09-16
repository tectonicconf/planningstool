# planningstool
Volunteer scheduling and shift management system for Tectonic 2026 — automated shift assignment, cancellation/backup handling, and email notifications for ~200 volunteers.

# Tectonic 2026 Volunteer Scheduling Tool

A lightweight web application for scheduling and managing approximately 200 volunteers for Tectonic 2026.

The platform allows volunteers to view, accept, decline and cancel their shifts through a personal link, while the People Team can manage the complete planning through a simple admin interface.

## Tech Stack

- Next.js App Router
- React + TypeScript
- Supabase / PostgreSQL
- Resend
- Vercel
- Python + Google OR-Tools for initial scheduling

## Access & Security

### Public
- `/` — volunteer access-code entry
- `/shift/[token]` — personal volunteer page, accessible only with a long random token
- Volunteer actions such as accept, decline and cancel

### Private / Admin
- Admin planning interface
- Volunteer management interface
- Creating/deleting shifts
- Adding/removing volunteers from shifts
- Supabase administrative access

---

## Volunteer Flow

### Homepage `/`

- Tectonic branding
- Volunteer enters their personal access code
- Redirect to `/shift/[token]`

### Volunteer Page `/shift/[token]`

Shows all shifts assigned to the volunteer.

Each shift shows:

- Date
- Start and end time
- Hours
- Location
- Shift type
- Status: `pending` or `confirmed`

For a **pending** shift, the volunteer can:

- Accept
- Decline

For a **confirmed** shift, the volunteer can:

- Cancel the shift
- Enter a cancellation reason
- Submit the cancellation

All actions happen per individual shift.

---

## Email Flow

### Initial Assignment

When a volunteer is scheduled:

1. Send an assignment email.
2. Show all currently confirmed shifts.
3. Show newly assigned/pending shifts.
4. Include the volunteer's personal link.

### Acceptance

When a volunteer accepts a shift:

1. Set assignment status to `confirmed`.
2. Send a confirmation email.
3. Include all currently confirmed shifts.
4. Include the personal link.

### Decline / Cancellation

When a volunteer declines or cancels:

1. Set assignment status to `cancelled`.
2. Send a cancellation confirmation email.
3. Include all remaining confirmed shifts.
4. Start the automatic backup flow.

The same personal link is reused in every email.

---

## Admin MVP

The admin interface has two main views.

### 1. Planning View — Shifts First

Planning is grouped by:

**Date → Location → Time → Individual Shift**

Locations are displayed as expandable sections.

Each shift shows:

- Shift type
- Exact location / area
- Start and end time
- Required volunteers
- Assigned volunteers
- Remaining open spots
- Full names of assigned volunteers

Admins can:

- Add a volunteer directly to a shift
- Search by name, email or volunteer ID when adding
- Remove a volunteer from a shift
- Create a shift
- Delete a shift
- Filter by date, location, time and shift type

The same shift type may occur simultaneously at multiple locations. Each is treated as a separate shift.

### 2. Volunteers View — Volunteers First

Show a searchable table containing all volunteers.

For each volunteer show:

- Unique volunteer ID
- Name
- Email
- Organization
- Number of assigned shifts
- All assigned shifts

Each individual assignment shows:

- Date
- Time
- Location
- Shift type
- Status
- Remove button

Admins can:

- Search by name, email or volunteer ID
- Filter volunteers
- Add a volunteer to another shift
- Remove an individual assignment

If a volunteer has multiple shifts, display every shift separately.

Both admin views use the same Supabase data. Changes made in one view must immediately be reflected in the other.

Advanced volunteer profiles, analytics and notes are outside the MVP scope.

---

## Backup / Automatic Replacement Flow

When a volunteer declines or cancels:

1. Set their assignment to `cancelled`.
2. Check whether the shift has fewer occupied positions than `volunteers_needed`.
3. Search the backup pool for an eligible replacement.

A backup is eligible if:

- `is_backup = true`
- They are available for the shift
- They have no overlapping active assignment
- They do not already have an active assignment for that shift

### Backup Selection

Go through the backup list in order:

1. Select the first eligible backup whose preferences include the shift type.
2. If none match the preference, select the first eligible backup.

The selected backup:

1. Receives a new `pending` assignment.
2. Automatically receives an assignment email.
3. Can accept or decline through their personal link.

If accepted:

`pending → confirmed`

If declined:

`pending → cancelled → try next eligible backup`

Already confirmed volunteers are never moved or swapped between shifts.

If no eligible backup exists, the position remains open.

---

## Database

### `volunteers`

- `id`
- `first_name`
- `last_name`
- `email`
- `phone_number`
- `access_code`
- `magic_link_token`
- `preferences`
- `availability`
- `is_backup`
- `wants_responsibility`
- `association`
- `uploaded_video`
- `created_at`

### `shifts`

- `id`
- `day`
- `slot`
- `start_time`
- `end_time`
- `hours`
- `location`
- `role_category`
- `volunteers_needed`
- `created_at`

### `assignments`

- `id`
- `volunteer_id`
- `shift_id`
- `status` (`pending`, `confirmed`, `cancelled`)
- `cancellation_reason`
- `updated_at`
- `updated_by`
- `last_email_sent_at`
- `last_email_type`
- `created_at`

For capacity calculations:

- `pending` = occupied position
- `confirmed` = occupied position
- `cancelled` = does not occupy a position

---

## Shift Types

- Setup & Logistics
- Technical Support
- Guest Flow & Stewarding
- Info & Welcome
- Food & Drinks
- Runner & Flexible Support
- Stage & Session Support

---

## Time Slots

### October 20
- Morning — Hackathon / Setup
- Afternoon — Hackathon / Setup
- Evening — Hackathon / Setup

### October 21
- Morning
- Afternoon
- Evening

### October 22
- Morning — Breakdown
