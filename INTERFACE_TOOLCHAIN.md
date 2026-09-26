# ITopp — Interface Build Tools (supplement to IMPLEMENTATION_PLAN.md Phase 1)

This file answers: what exact tools to use to build the ITopp interface. All free for pilot. Matches stack: Next.js + Supabase + Vercel.

## 1. Design before code: Figma (free)
- Create 1 Figma file, 4 pages: Student feed (Matched + Browse), Posting detail, Company applicant table, Admin verification queue.
- Alternative if Figma blocked: Penpot (open-source, in browser).
- Output: wireframes approved before building forms. Screenshot this for evidence.

## 2. Frontend framework: Next.js App Router + TypeScript + Tailwind CSS
- Scaffold: `npx create-next-app@latest --typescript --tailwind --app`
- Why: one repo serves student / company / admin UI + API routes; Tailwind provides the spacing/color tokens from the plan.

## 3. Component kit: shadcn/ui + Radix + Lucide
- Init: `npx shadcn@latest init`, then add `button input textarea select badge card avatar dialog toast table tabs skeleton`
- Icons: `npm i lucide-react` — ShieldCheck (verified), Flag (Report), Clock (pending-days), Upload (CV/docs).
- Utils: `clsx` + `tailwind-merge` (ships with shadcn).
- Maps to plan Phase 1 list exactly: Button/Input/FileUpload/Card/Badge/Modal/Toast/Table/Tabs/EmptyState/Skeleton.

## 4. Forms: React Hook Form + Zod
- `npm i react-hook-form zod @hookform/resolvers`
- One Zod schema per form: student profile (CGPA 0-5, skills[], 5MB file cap), company profile (CAC required), posting (title/dept/location required, stipend field forbidden), application answers.

## 5. Preview / QA: /design page + Vercel previews
- Fastest (no extra setup): create `app/design/page.tsx` rendering every component in every state (pending/verified/rejected/suspended, applied/shortlisted/accepted/rejected/withdrawn).
- Optional full Storybook: `npx storybook@latest init`.
- Each push to `main` on the `badge` repo produces a Vercel preview URL — open on mobile width (360px) and screenshot.

## Install-all sequence (Phase 0 + Phase 1 start)
```
npx create-next-app@latest itopp --typescript --tailwind --app
cd itopp
npx shadcn@latest init
npm i lucide-react react-hook-form zod @hookform/resolvers
npm run dev
```

Acceptance: `/design` shows all states readable, AA contrast, one import `@/components/ui`.
