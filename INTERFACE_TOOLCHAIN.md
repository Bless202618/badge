# ITopp — Interface Build Tools (supplement to IMPLEMENTATION_PLAN.md Phase 1)

Verified against official pricing pages, Sep 2026. Best FREE option per tool — all sufficient for the 1-department pilot. Matches stack: Next.js + Supabase + Vercel.

## Free-tier verdict (checked)

| Tool | Best free version | Free limits (verified) | Verdict for ITopp pilot |
| :--- | :--- | :--- | :--- |
| Figma | Starter (free) | Unlimited drafts, UI kits/templates, 150 AI credits/day up to 500/mo, 30-day version history | OK — work in drafts, 1 file with 4 pages (feed, posting detail, company table, admin queue) |
| Next.js + Tailwind | MIT open-source, free forever | No limits | OK — `create-next-app --typescript --tailwind` |
| shadcn/ui + Radix + Lucide | MIT/ISC open-source, free forever | Copy-paste components, no account needed | OK — best free component kit, no paid tier exists |
| React Hook Form + Zod | MIT open-source, free forever | No limits | OK |
| Supabase | Free plan ($0) | 500MB DB, 1GB storage, 5GB egress, 50k MAU, 2 projects; pauses after 1 week idle | OK — pilot fits easily; just re-activate if paused. Upgrade to Pro ($25) only at real launch |
| Vercel | Hobby ($0) | 1M edge requests/mo, 100GB transfer, 1M function invocations, unlimited deployments, 1 seat; non-commercial use | OK for student pilot; move to Pro ($20/mo) at commercial launch |
| Resend (email) | Free ($0) | 3,000 emails/mo, max 100/day, 3 domains | OK — status/match/report emails are low volume |
| GitHub | Free (repo `badge` is public) | Unlimited public repos | OK — already in use |
| Node.js runtime | LTS, free | — | BLOCKER — not installed on this PC yet (see below) |
| Penpot (backup design) | Free/open-source | Self-host or cloud free | Backup only if Figma blocked |

## 1. Design before code: Figma Starter (free)
- Create 1 Figma file in drafts, 4 pages: Student feed (Matched + Browse), Posting detail, Company applicant table, Admin verification queue.
- Alternative if Figma blocked: Penpot (free, browser-based).
- Output: wireframes approved before building forms. Screenshot this for evidence.

## 2. Frontend framework: Next.js App Router + TypeScript + Tailwind CSS (free)
- Scaffold: `npx create-next-app@latest --typescript --tailwind --app`
- Why: one repo serves student / company / admin UI + API routes; Tailwind provides the spacing/color tokens from the plan.

## 3. Component kit: shadcn/ui + Radix + Lucide (free, no paid tier)
- Init: `npx shadcn@latest init`, then add `button input textarea select badge card avatar dialog toast table tabs skeleton`
- Icons: `npm i lucide-react` — ShieldCheck (verified), Flag (Report), Clock (pending-days), Upload (CV/docs).
- Utils: `clsx` + `tailwind-merge` (ships with shadcn).
- Maps to plan Phase 1 list exactly: Button/Input/FileUpload/Card/Badge/Modal/Toast/Table/Tabs/EmptyState/Skeleton.

## 4. Forms: React Hook Form + Zod (free)
- `npm i react-hook-form zod @hookform/resolvers`
- One Zod schema per form: student profile (CGPA 0-5, skills[], 5MB file cap), company profile (CAC required), posting (title/dept/location required, stipend field forbidden), application answers.

## 5. Backend + hosting + email (all on free tiers above)
- Supabase Free: 1 project for ITopp (keep 2nd free slot for dev), buckets `cvs` + `verification-docs` private. Expect pause after 1 idle week — one click to resume.
- Vercel Hobby: connect `badge` repo, auto preview per push.
- Resend Free: 1 domain, templates for status-change / new-match / report-ack (all under 100/day in pilot).

## 6. Preview / QA: /design page + Vercel previews (free)
- Fastest (no extra setup): create `app/design/page.tsx` rendering every component in every state (pending/verified/rejected/suspended, applied/shortlisted/accepted/rejected/withdrawn).
- Optional full Storybook (free): `npx storybook@latest init`.
- Each push to `main` produces a Vercel preview URL — open on mobile width (360px) and screenshot.

## Blocker: install Node.js LTS first (free)
`node`/`npm` are not on this PC yet. Run in PowerShell, then reopen terminal:
```
winget install -e --id OpenJS.NodeJS.LTS
node --version
npm --version
```

## Install-all sequence (after Node)
```
npx create-next-app@latest itopp --typescript --tailwind --app
cd itopp
npx shadcn@latest init
npm i lucide-react react-hook-form zod @hookform/resolvers
npm run dev
```

Acceptance: `/design` shows all states readable, AA contrast, one import `@/components/ui`.
