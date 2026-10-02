# ITopp — Backup & Restore Runbook

## Honest starting point
Free-tier Postgres has **no automatic daily backups**. Until you upgrade,
backups are manual. Do the weekly export below without fail during pilot.

## Weekly backup (5 minutes, free)
**Option A — CSV per table (easiest):**
1. Supabase dashboard → your project → **Table Editor**
2. Per table (User, StudentProfile, CompanyProfile, Posting, Application,
   Rating, Report, Notification): open table → **Export as CSV** → save into
   a dated folder, e.g. `backups/2026-10-09/`.

**Option B — full database dump (better, one file):**
1. Install PostgreSQL client tools (comes with `winget install PostgreSQL.17`
   or use the Supabase SQL Editor).
2. Run (password = your database password):
```
pg_dump "postgresql://postgres.alxqfdvscnwxjmhxfnbe:[PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres" -F c -f itopp-backup.dump
```
Never commit the dump (it contains password hashes + personal data).

## Restore
- CSV: Table Editor → **Insert → Import CSV** per table, in this order:
  User → StudentProfile → CompanyProfile → Posting → Application → others.
- Dump: `pg_restore -d <DATABASE_URL> itopp-backup.dump`
- Then run `npm run db:seed` only if you also want the demo accounts back.

## When to upgrade
- **Supabase Pro ($25/mo):** daily backups kept 7 days, no pausing, 8GB data.
  Upgrade the week real (non-demo) students and companies go live.
- Also upgrade Vercel Hobby → Pro ($20/mo) at commercial launch
  (Hobby is for non-commercial use).

## Disaster contacts
- Database: Supabase dashboard → Support (free: community; Pro: email).
- App: Vercel dashboard → Deployments → **Redeploy** previous good commit.
  Every push here is a restore point: https://github.com/Bless202618/badge
