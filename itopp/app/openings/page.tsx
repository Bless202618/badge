import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchScore } from "@/lib/match";
import { DEPARTMENTS } from "@/lib/options";

export interface FeedPosting {
  id: string;
  title: string;
  location: string;
  durationMonths: number;
  departments: string[];
  skillsRequired: string[];
  companyName: string;
  score: number;
  reasons: string[];
}

export default async function OpeningsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const fDept = typeof q.dept === "string" ? q.dept : "";
  const fLoc = typeof q.loc === "string" ? q.loc.trim() : "";
  const fSkill = typeof q.skill === "string" ? q.skill.trim().toLowerCase() : "";
  const fMaxDur = typeof q.dur === "string" && q.dur !== "" ? Number(q.dur) : 0;

  const me = await getSessionUser();
  const profile =
    me?.role === "student"
      ? await db.studentProfile.findUnique({ where: { userId: me.id } })
      : null;

  const all = await db.posting.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: { company: { include: { user: true } } },
  });

  // Trust gate: only openings from fully verified companies are visible.
  const visible = all.filter(
    (p) =>
      p.company.verificationStatus === "verified" &&
      p.company.user.status === "verified"
  );

  const scored: FeedPosting[] = visible.map((p) => {
    const base = {
      id: p.id,
      title: p.title,
      location: p.location,
      durationMonths: p.durationMonths,
      departments: p.departments,
      skillsRequired: p.skillsRequired,
      companyName: p.company.companyName,
    };
    if (profile) {
      const m = matchScore(
        { department: profile.department, skills: profile.skills },
        { departments: p.departments, skillsRequired: p.skillsRequired }
      );
      return { ...base, score: m.score, reasons: m.reasons };
    }
    return { ...base, score: 0, reasons: [] };
  });

  const filtered = scored.filter((p) => {
    if (fDept && !p.departments.includes(fDept)) return false;
    if (fLoc && !p.location.toLowerCase().includes(fLoc.toLowerCase()))
      return false;
    if (
      fSkill &&
      !p.skillsRequired.some((s) => s.toLowerCase().includes(fSkill)) &&
      !p.title.toLowerCase().includes(fSkill)
    )
      return false;
    if (fMaxDur > 0 && p.durationMonths > fMaxDur) return false;
    return true;
  });

  const matched = profile
    ? [...filtered].sort((a, b) => b.score - a.score)
    : [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Openings</h1>

      <form
        method="GET"
        action="/openings"
        className="grid gap-2 rounded-xl border bg-white p-4 sm:grid-cols-4"
      >
        <select
          name="dept"
          defaultValue={fDept}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <Input name="loc" placeholder="Location…" defaultValue={fLoc} />
        <Input name="skill" placeholder="Skill or keyword…" defaultValue={typeof q.skill === "string" ? q.skill : ""} />
        <select
          name="dur"
          defaultValue={fMaxDur ? String(fMaxDur) : ""}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Any duration</option>
          <option value="3">Up to 3 months</option>
          <option value="6">Up to 6 months</option>
          <option value="12">Up to 12 months</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-[#0B5FFF] px-4 py-2 text-sm font-bold text-white sm:col-span-4"
        >
          Filter
        </button>
      </form>

      {profile ? (
        <>
          <h2 className="text-lg font-bold">
            Matched for you ({matched.length})
          </h2>
          {matched.length === 0 ? (
            <Empty text="No openings match your filters. Clear them or complete your profile (skills matter)." />
          ) : (
            <div className="space-y-3">
              {matched.map((p) => (
                <PostingCard key={p.id} p={p} />
              ))}
            </div>
          )}
          <h2 className="pt-2 text-lg font-bold">Browse all</h2>
          <div className="space-y-3">
            {filtered.map((p) => (
              <PostingCard key={p.id} p={p} />
            ))}
          </div>
        </>
      ) : (
        <>
          {me ? (
            <p className="rounded-lg bg-[#FEF3C7] p-3 text-sm">
              Complete your student profile so we can rank matches for you.
            </p>
          ) : (
            <p className="rounded-lg bg-[#EFF6FF] p-3 text-sm">
              <Link href="/login" className="font-bold text-[#0B5FFF] underline">
                Log in
              </Link>{" "}
              as a verified student to see matched-first rankings.
            </p>
          )}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Empty text="No openings right now. Check back soon." />
            ) : (
              filtered.map((p) => <PostingCard key={p.id} p={p} />)
            )}
          </div>
        </>
      )}
    </main>
  );
}

function PostingCard({ p }: { p: FeedPosting }) {
  const initials = p.companyName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-wrap items-center gap-3 pt-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0B5FFF]/10 text-sm font-extrabold text-[#0B5FFF]">
          {initials}
        </span>
        <div className="min-w-48 flex-1">
          <Link
            href={`/openings/${p.id}`}
            className="font-bold hover:text-[#0B5FFF] hover:underline"
          >
            {p.title}
          </Link>
          <p className="text-sm text-[#6B7280]">
            {p.companyName} · {p.location} · {p.durationMonths} months
          </p>
          {p.reasons.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#0B5FFF]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
        <StatusBadge status="verified" />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/openings/${p.id}`}>View</Link>}
        />
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
      {text}
    </div>
  );
}
