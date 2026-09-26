# ITopp — Implementation Plan

Derived from `Untitled document (1).md` PRD v1. No university dashboard, no stipend field, no in-app messaging, no third-party verification in v1.

## Data Model (core, v1)
- `users(id, role: student|company|admin, email, password_hash, status: pending|verified|suspended)`
- `student_profiles(user_id, name, department, level, cgpa, skills[], cv_url, verification_docs[], verification_status)`
- `company_profiles(user_id, name, cac_number, contact_name, contact_phone, website, verification_docs[], verification_status)`
- `postings(id, company_id, title, department[], location, duration_months, skills_required[], custom_questions JSON, is_quick_post, status: draft|pending|active|closed, created_at)`
- `applications(id, posting_id, student_id, answers JSON, status: applied|shortlisted|accepted|rejected|withdrawn, applied_at, updated_at)`
- `ratings(id, from_user, to_user, placement_ref, score, comment, created_at)`
- `reports(id, reporter_id, company_id, reason, details, status: open|investigating|resolved|dismissed, created_at, resolved_at)`
- `notifications(id, user_id, type, payload JSON, read_at, created_at)`

## Phase 0 — Foundation
**Output:** runnable app shell + auth + roles + DB.
- Init repo, env config, DB migrations for tables above, file upload (CV, IDs, CAC docs) with private bucket.
- Auth: signup/login, session, 3 roles. Admin account seeded for you as sole verifier.
- Basic layout + route guards per role.
- **Done when:** can register as student/company, login, see role-specific home, upload a file.

## Phase 1 — Profiles + Verification Queue
**Output:** verification loop working end-to-end.
- Student form: name, department, level, CGPA, skills list, CV upload + ID/admission letter upload.
- Company form: company name, CAC number, contact, website + legitimacy docs.
- Admin queue: list pending, approve/reject with reason, status visible to user.
- Gate: unverified users cannot post or apply, only edit profile.
- **Done when:** student submits docs → admin approves → status flips to verified; same for company. Rejection shows reason.

## Phase 2 — Postings (Custom + Quick-Post)
**Output:** companies can publish openings.
- Custom posting: department, location, duration, required skills, custom screening questions (text/short answer), open/close dates.
- Quick-post template: title + department + location + duration with sensible defaults, 1-screen flow.
- Posting status: active/closed; company can close, admin can suspend/delist.
- Validation: no stipend/compensation field (per out-of-scope).
- **Done when:** verified company creates both posting types, edits/closes one, unverified company blocked.

## Phase 3 — Hybrid Discovery Feed + Matching
**Output:** students see matched-first feed.
- Match score: department match + skills overlap + level eligibility. Simple deterministic score v1 (no ML).
- Feed UI: "Matched for you" section on top, full browse with filters (department, location, skills, duration) below.
- Posting detail page with criteria + required questions preview.
- **Done when:** test student with skills X sees relevant posting ranked first; filters narrow results correctly.

## Phase 4 — Applications + Status Tracking
**Output:** capped application loop with visibility.
- Apply flow: answer custom questions, submit CV snapshot. Enforce max 5 active (applied+shortlisted) per student; withdrawn/rejected frees slot with clear error message.
- Company view: applicant list per posting, shortlist/accept/reject actions.
- Student view: application list with status Applied → Shortlisted → Accepted/Rejected + days-pending + company typical response time (avg days to first action).
- No in-app messaging or interview scheduling — show off-app contact instruction only after shortlist.
- **Done when:** 5-active cap enforced, status changes reflect both sides instantly, pending-days display correct.

## Phase 5 — Trust Loop + Core Notifications
**Output:** ratings, reporting, notifications.
- Two-way ratings: enabled only after placement marked complete; one rating per pair per placement.
- Report this company button on posting + company page + application page; creates report, shows acknowledgment; admin resolves within 48h → investigation/suspension/delist.
- Notifications (in-app + email): status change, new auto-matched opening, report acknowledgment.
- Admin metrics: verified companies count, verified students count, application→shortlist %, application→placement %, report volume + resolution time.
- **Done when:** full loop verified posting → application → status → rating/report → notification works in pilot data.

## Phase 6 — MVP Pilot Hardening (Go-to-Market)
**Output:** ready for 1 department, 15–20 companies.
- Seed scripts, empty states, loading/error handling, mobile-responsive check.
- Manual onboarding checklist: recruit companies, warm student onboarding via class groups.
- Success tracking: dashboard or query for the 5 PRD metrics.
- **Done when:** pilot cohort can complete full loop without developer intervention.

## Phase 7 — Placement Monitoring (Phase 2 PRD, deferred)
**Output:** post-acceptance suite. Do NOT build in MVP.
- Digital logbook (weekly entries + supervisor sign-off), attendance record, supervisor evaluation form, visit scheduling, reminder notifications.
- **Done when:** accepted student logs week → supervisor signs → evaluation submitted.

## Build Order Summary
0 Foundation → 1 Verification → 2 Postings → 3 Discovery → 4 Applications → 5 Trust+Notifs → 6 Pilot → 7 Placement suite

Each phase is shippable and demoable. Do not start Phase 3 until Phase 1 verification gate works, since matching depends on verified profile data.
