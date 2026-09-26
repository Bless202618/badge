# ITopp — Detailed Implementation Plan (v2)

Source of truth: `Untitled document (1).md` (PRD v1) + `README.md`.
Current repo state: docs-only (`README.md`, PRD, `.gitignore` for `.env`, empty `.env.example`). No app code yet. Remote: `https://github.com/Bless202618/badge` (public, branch `main`).

Out of scope for v1 (must enforce in code reviews): no university dashboard, no stipend/compensation field on postings, no in-app messaging/interview scheduling, no third-party verification — you are the sole verifier.

---

## Architectural Decisions (decide once, before code)

1. **App type: monolith web app, mobile-responsive.** No native app for MVP. One deployable.
   - Rationale: solo builder, 1-department pilot, fastest to validate full loop.

2. **Recommended stack: Next.js (App Router, TypeScript) + Supabase (Postgres + Auth + Storage) + Vercel.**
   - Next.js handles marketing pages, student/company/admin UI, API routes/server actions in one repo.
   - Supabase gives managed Postgres (relational fits applications/verification), Auth (email/password), private Storage buckets (CVs, school IDs, CAC docs), Row Level Security per role.
   - Alternative if you prefer full control: Next.js + Prisma + Postgres (Neon/Supabase DB) + UploadThing/S3. More wiring, same shape.
   - Do NOT introduce: microservices, GraphQL, ML matching, realtime sockets for MVP.

3. **Auth & roles: Supabase Auth + `profiles(role: student|company|admin)` gate.**
   - 3 roles only. One seeded admin (you). Middleware blocks unverified students from applying and unverified companies from posting.
   - Verification is manual status flip by admin, not automatic.

4. **File storage: private buckets, signed URLs only.**
   - Buckets: `cvs` (student CVs, viewable by applied-to companies + admin), `verification-docs` (IDs, admission letters, CAC docs — admin only), never public.
   - Validate: PDF/DOC/DOCX/JPG/PNG, ≤5MB, virus-scan deferral acceptable for pilot.

5. **Matching v1: deterministic score, no ML.**
   - `score = dept_match(40) + skills_overlap(40) + level_eligibility(20)`. Sort matched-first, then browse with filters. Explainable and testable.

6. **Notifications v1: in-app table + email.** No SMS/push.
   - Events: application status change, new auto-matched opening, report acknowledgment. Email via Resend or Supabase SMTP. Phase-2 reminders (logbook/evaluation) deferred.

7. **Environments: `.env.example` must list `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), `RESEND_API_KEY`, `ADMIN_EMAIL`.** `.env` gitignored (already done).

---

## Phase 0 — Repo & Technical Foundation
**Concrete output:** `npm run dev` works, CI green, DB migrated, storage buckets created.
- Next.js TS scaffold, ESLint/Prettier, folder structure: `app/(student|company|admin)`, `components/`, `lib/`, `supabase/migrations/`.
- Supabase project, migrations for all tables below, RLS policies per role, storage buckets + policies.
- `.env.example` filled, Vercel preview deploys on push to `main`, GitHub branch protection.
- **Acceptance:** fresh clone → `npm i && npm run dev` runs; login page loads; buckets reject public access.
- **DB core (v1):** `users`, `student_profiles`, `company_profiles`, `postings`, `applications`, `ratings`, `reports`, `notifications` (fields as in v1 plan). Add `verification_reviews(profile_id, reviewer, decision, reason, decided_at)` for audit trail and 48h SLA tracking on reports.

## Phase 1 — Design System (before feature UI)
**Concrete output:** `components/ui/*` + Storybook or `/design` preview page, used by all later phases.
- Tokens: colors (primary trust blue `#0B5FFF`, success green, warning amber, danger red, neutrals), 4px spacing scale, radius 8/12, font: Inter/system, type scale 12–32.
- Components: Button (primary/secondary/danger/ghost), Input/Textarea/Select, FileUpload (drag-drop + 5MB validation), Card (posting, application), Badge (verification: pending/verified/rejected/suspended; application: applied/shortlisted/accepted/rejected/withdrawn), Avatar, EmptyState, Modal, Toast, Pagination, Table (admin queues), Tabs (Matched/Browse), Skeleton loaders.
- Layouts: public nav, student shell, company shell, admin shell; mobile-first (360px) responsive; accessible labels, focus states, contrast AA.
- **Acceptance:** every state above renderable in isolation; dark-on-light readable; one import path `@/components/ui`.

## Phase 2 — Auth, Profiles & Verification Queue
**Concrete output:** end-to-end trust gate working.
- Screens: signup (role select) / login / forgot; student profile form (name, department, level, CGPA, skills tags, CV + ID/admission upload); company form (name, CAC number, contact, website + docs); verification status banner; admin queue (filter pending, approve/reject with reason, audit log).
- Rules: unverified cannot post/apply; rejection shows reason and allows resubmit; admin actions timestamped.
- **Acceptance:** student submits → admin approves → can apply; company submits → admin approves → can post; rejected user sees reason. E2E test covers both.

## Phase 3 — Postings (Custom + Quick-Post)
**Concrete output:** companies publish; admin can delist.
- Custom form: title, departments[], location, duration_months, skills_required[], custom screening questions (add/remove short-text), open/close dates. Quick-post: 1 screen with defaults (duration 6 months, dept prefilled). Validations: required title/dept/location; block any stipend/salary field (lint + code review checklist).
- Company postings list (active/closed), edit/close; posting detail; admin suspend/delist with reason.
- **Acceptance:** verified company creates both types; unverified blocked with clear message; closed posting hides Apply.

## Phase 4 — Hybrid Discovery & Matching
**Concrete output:** matched-first feed students trust.
- Feed: `Matched for you` (score-sorted, show match reason chips e.g. "2/3 skills match") + `Browse all` with filters (dept, location, skills, duration) + search. Posting detail shows criteria + questions preview + Report button.
- Scoring function unit-tested with fixtures (dept mismatch = demote; skills overlap ordering).
- **Acceptance:** fixture student sees expected ranking; filters narrow correctly; empty state guides to complete profile.

## Phase 5 — Applications, Review & Response Signals
**Concrete output:** capped, transparent application loop.
- Apply modal (answers + CV snapshot reference). Cap: max 5 active (applied+shortlisted) enforced server-side with friendly error + link to withdraw. Withdraw frees slot.
- Company applicant table per posting (filter by status, view CV via signed URL, shortlist/accept/reject with one click + optional note). Student applications page (status timeline, days-pending, company avg response days).
- Off-app handoff: after shortlist show "Company will contact you via email/phone — interviews happen off-app" (no chat UI).
- **Acceptance:** 6th apply blocked; status change visible both sides <5s; pending-days accurate; avg response computed from history.

## Phase 6 — Trust Loop, Reports & Notifications
**Concrete output:** safety + visibility complete.
- Ratings: unlock only when application accepted and marked complete; one rating per pair per placement (1–5 + comment). Display avg on company page and student reliability note for companies.
- Report flow: button everywhere (posting, company, application) → reason + details → acknowledgment screen + in-app/email receipt; admin report queue with SLA timer (48h), actions: investigate/suspend/delist/dismiss; resolution notifies reporter.
- Notifications center + email templates for the 3 launch triggers. Admin metrics page: verified companies, verified students, app→shortlist %, app→placement %, reports + median resolution time.
- **Acceptance:** full pilot script passes: post → match → apply → shortlist → accept → complete → rate both ways; report filed → resolved <48h in test data; all 3 notifications fire.

## Phase 7 — Pilot Hardening & Go-to-Market Enablement
**Concrete output:** shippable to 1 department, 15–20 companies.
- Seed script (departments, skills list, demo company + postings), loading/error/empty states audit, mobile pass, performance (feed <2s on 50 postings), backup/restore runbook.
- Onboarding kit: company 1-pager, student signup guide, admin verification checklist (CAC check steps, ID check steps).
- **Acceptance:** new user completes loop unaided; 5 PRD metrics queryable; rollback tested.

## Phase 8 — Placement Suite (deferred, do not build in MVP)
Logbook (weekly entries + supervisor sign-off), attendance, supervisor evaluation, visit scheduling + reminder notifications. Gate Phase 8 on pilot conversion data.

---

## Build Order & Gates
`0 Foundation → 1 Design System → 2 Verification → 3 Postings → 4 Discovery → 5 Applications → 6 Trust/Notifs → 7 Pilot → 8 Placement suite`
Gate: no Phase 4 work until verification gate (Phase 2) passes, since matching reads verified profile fields.

## Risks
Manual verification bottleneck (mitigate: admin queue SLA + bulk actions) → document forgery (mitigate: school email check + phone contact for companies) → low company response (mitigate: response-time badge pressures replies).
