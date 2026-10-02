# ITopp

Bridge the gap between university walls and industry by making IT placement discovery verified, transparent, and accountable — for both students and companies.

## Problem
400-level IT students struggle to find verified, legitimate IT placement (SIWES-style) opportunities. The process today is informal, unverified, and disconnected — students rely on word-of-mouth or unverified listings, companies have no structured way to reach qualified students, and there's no accountability once a placement starts.

## Solution
ITopp connects verified companies offering IT placements with verified 400-level students, providing matched discovery, structured applications, in-app status tracking, and support through the placement period.

## Target Users
- **Primary:** 400-level IT students seeking verified placement opportunities
- **Secondary:** Companies looking to source screened, qualified IT interns
- **Platform owner:** Verifies both sides and moderates trust

## Core Value
- Students get verified, real openings — not scams or dead ends
- Companies get pre-screened, eligible candidates matched to criteria
- Both sides get visibility into application status

## MVP Features (Phase 1)
- Company + student verification (manual review by platform owner)
- Hybrid discovery feed (auto-matched first, full browse below)
- Custom posting criteria + quick-post template
- Application flow with status tracking: Applied → Shortlisted → Accepted / Rejected (cap: 5 active applications)
- Student profile: basic info + skills + CV upload
- Two-way ratings + Report this company (reviewed within 48h)
- Core notifications: status change, new match, report acknowledgment

## Out of Scope for v1
- No university dashboard, no stipend disclosure on postings, no in-app messaging/interview scheduling, no third-party verification

## Roadmap
- **Phase 2:** Logbook, attendance, supervisor evaluation, visit scheduling
- **Phase 3:** Monetization, expansion to more departments/universities

## Status
MVP built and running on real Postgres — Phases 0–6 live (auth, verification,
postings, matched feed, applications, ratings, reports, notifications).
Phase 7 pilot kit: ONBOARDING.md + BACKUP.md + demo seeder (`npm run db:seed`).
