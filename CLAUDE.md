@AGENTS.md

# Tectonic 2026 Volunteer Planning Tool — project summary

This section is a snapshot of the app as of October 2026, written so a fresh
Claude session can pick up work without re-deriving context from scratch.
`README.md` is the original product spec (still useful for intent/wording);
this file documents what's actually built, including places where reality
has since diverged from that spec.

## What this is

A Next.js app for Tectonic 2026 (a startup conference in Ghent, Oct 20–22)
that lets ~200 volunteers view and respond to their shifts via a personal
link (no passwords — the link's token *is* the credential), and lets the
organizing team manage shifts/volunteers through an admin interface.

**Stack:** Next.js (App Router, Turbopack, Next 16 — see the note at the top
of `AGENTS.md` about this version having breaking changes from training
data), React, TypeScript, Tailwind, Supabase (Postgres + PostgREST),
Resend for email. A separate Python/OR-Tools script under `optimizer/` does
the *initial* shift-assignment pass offline (CSV in, CSV out) — it is not
wired into the Next.js app at runtime; results get loaded into Supabase
manually.

## Route map

```
src/app/(portal)/        — volunteer-facing, public, dark theme
  page.tsx                 "/" — token entry; auto-skips to shifts if a
                            token is already saved on this device
  shift/[token]/page.tsx   personal dashboard: shifts list, Accept/Decline/
                            Cancel, gated behind the onboarding quiz
  shift/[token]/not-found.tsx / loading.tsx
  faq/page.tsx            static FAQ (search + category filter + accordion)
  academy/page.tsx        static "Startup 101" glossary
  onboarding/page.tsx     static onboarding info sections
  layout.tsx              mounts <PortalNav> (persistent top nav + logo)

src/app/admin/            — internal tool, light theme, no auth gate (!)
  page.tsx                 Planning board: shifts grouped by date → location
                            → time; add/remove volunteers, check-in
  volunteers/page.tsx      Volunteers board: searchable table, per-assignment
                            status + check-in
  activity/page.tsx        feed of recent confirmed/cancelled assignments,
                            in two columns
  layout.tsx               force-dynamic (never statically cached — see
                            "Known gaps" below for why that still doesn't
                            make it fast in dev)
```

**Note:** `/admin/*` has no authentication of any kind — it's reachable by
anyone who finds the URL. That was true before this session and hasn't been
addressed; flag it if asked about security.

## Data model (Supabase)

`README.md`'s DB section is now out of date. Current reality:

**`volunteers`** — as documented in README, plus:
- `quiz boolean` — whether they've passed the onboarding quiz gate. Added
  this session; **nullable** in practice (reads back as `null` for old rows,
  not `false`) — the app treats `null`/`false` identically since JS falsy
  semantics make this harmless, but it's not a clean `not null default
  false` column. Worth tidying if anyone's in there anyway.

**`assignments`** — as documented in README, plus:
- `updated_at timestamptz not null default now()` — **set explicitly by
  application code** on every status-changing write (accept/decline/cancel
  in `assignments.ts`). There is no DB trigger and no migrations directory
  in this repo — all schema changes so far have been ad hoc `alter table`
  statements run manually in the Supabase SQL editor, communicated to the
  user via chat. If you add a new status-changing code path, remember to
  set `updated_at` there too or the Activity feed won't pick it up.
- `checked_in_at timestamptz` (nullable) — null = not checked in; a
  timestamp = when an admin checked them in via the Planning or Volunteers
  board. Deliberately a timestamp rather than a boolean so the UI can show
  *when*, at near-zero extra cost.

**Not implemented despite being in README:** the "Backup / Automatic
Replacement Flow" section (auto-reassigning a backup volunteer when someone
cancels) is spec-only. `is_backup` exists as a column but nothing in `src/`
reads it except a hardcoded `false` default on manual volunteer creation.
Don't assume this flow exists.

**Two Supabase clients** in `src/lib/supabase.ts`: `supabaseAdmin` (service
role, bypasses RLS) is what everything actually uses. The anon-key
`supabase` export is currently **unused** anywhere in `src/` — it's there
for if/when something needs a browser-safe client, not load-bearing today.

## Key flows

**Volunteer session persistence** — `src/lib/clientToken.ts`. Token is
saved to `localStorage` (no expiry) the moment the dashboard renders for a
*server-validated* token — never on raw form submit, so a mistyped token
can't get stuck and cause a redirect loop. `useSavedToken()` (built on
`useSyncExternalStore`, not a manual effect+setState, to satisfy the
react-hooks lint rule and avoid an SSR/hydration mismatch) is read by the
home page (auto-redirect) and `PortalNav` (keeps the "Shifts" tab pointing
at the right place, shows a logout icon). Wrong-token submission re-added a
server round-trip specifically so the input can shake-and-clear in place
instead of navigating to a not-found page.

**Onboarding quiz gate** — `AcademyGateCard.tsx` + `AcademyFlow.tsx`,
content in `src/data/onboardingQuiz.ts` (editable placeholder content — see
below). A volunteer can't see their real shift list until `volunteers.quiz`
is true. The dashboard shows blurred/locked skeleton shift cards (sized to
their actual shift count, or a "no shifts yet" message) until then. Pass
threshold and all Q&A content live in the data file. **Not persisted
across a page reload:** which step (welcome/info/quiz) a volunteer is
mid-way through is kept in React state only, not localStorage — reloading
mid-flow resets to "not started" (not a lost-progress bug exactly, just a
known simplification; flagged to the user at the time).

**Editable content files** (`src/data/*.ts`) — `faq.ts`, `onboarding.ts`,
`academy.ts`, `onboardingQuiz.ts`. These hold placeholder/made-up copy by
design (explicitly requested as easy-to-edit files a non-engineer — e.g.
marketing — can replace). FAQ/onboarding answers are intentionally
generic/placeholder text (`[Placeholder — ...]`) rather than invented facts
about the real event, since real volunteers will read this; the Academy
glossary content is real (general startup terminology, safe to author
directly).

**Admin data fetching** — `src/lib/adminData.ts` exports `getAdminTables()`,
a single `Promise.all` of the three base tables (shifts, assignments,
volunteers). All three admin pages fetch this once per page load and pass
it into `getPlanningShifts()` / `getVolunteersWithAssignments()` /
`getShiftDirectory()` / `getRecentAssignmentUpdates()`, each of which
accepts an optional pre-fetched `AdminTables` and only calls
`getAdminTables()` itself if none is given. **If you add a new admin data
view, fetch through this shared path rather than querying Supabase
directly** — the original code (before this session) had each page/view
independently re-querying the same tables, which was fixed once already.

**Server Action ownership pattern** — every volunteer-facing mutation
(`respondToAssignment`, `completeOnboardingQuiz`) re-derives the volunteer
from the token server-side and scopes the write to that volunteer's own
row; the client never passes a volunteer/assignment id that's trusted
on its own. Keep this pattern for any new volunteer action.

## Known gaps / things flagged but not fixed

- **No admin auth.** Mentioned above; raise it if relevant.
- **Admin dev-mode "slow tab switching"** — investigated this session.
  Confirmed real Supabase round-trip latency is small (~100–350ms per query
  from this environment, ~250ms for the combined 3-query fetch; row counts
  are modest: ~54 shifts, ~99 assignments, ~200 volunteers) and client-side
  navigation is fast once a route is warm (~40ms). Next.js **never caches
  pages in `next dev`** regardless of `revalidate`/`dynamic` config — so
  the usual ISR-style fix does nothing locally; it would only help on a
  deployed/production host, which the user confirmed is not where they were
  testing. If this comes up again: ask whether they're on localhost or
  deployed before reaching for caching, since the fix differs completely.
  Likely remaining cause is Turbopack's per-route recompilation after each
  dev-server restart (a one-time cost per route per restart, not fixable
  from application code) — if a future session revisits this, check
  whether the slowness is only on the *first* visit to a route after a
  restart (expected) or persists on repeated visits (would be a real bug).
- **Activity feed is a snapshot, not a log.** `getRecentAssignmentUpdates`
  shows each assignment's *current* status + `updated_at`; if someone
  confirms then later cancels, only "cancelled" shows. A true multi-event
  history would need a separate audit table (explicitly out of scope so
  far — README itself says this wasn't tracked yet).
- **No automated tests.** Verification throughout this project's history
  has been manual: `tsc --noEmit`, `eslint`, `next build`, and ad hoc
  Playwright scripts driven against real Supabase data (screenshotted, then
  deleted) — see the pattern of installing `playwright-chromium` into the
  session's scratch directory and tearing it down after. There's no
  committed test suite or CI config.
- **`optimizer/`** (Python/OR-Tools initial scheduler) is a one-off offline
  tool, not integrated with the web app at runtime — don't assume changes
  to Supabase data flow back into it or vice versa.
