import { db } from "./db";

// Average days from application to first decision, per company owner.
// Returns null when the company has no decided applications yet.
export async function companyResponseDays(
  companyOwnerId: string
): Promise<number | null> {
  const decided = await db.application.findMany({
    where: {
      posting: { company: { userId: companyOwnerId } },
      status: { in: ["shortlisted", "accepted", "rejected"] },
    },
    select: { createdAt: true, updatedAt: true },
    take: 100,
  });
  if (decided.length === 0) return null;
  const total = decided.reduce(
    (sum, a) => sum + (a.updatedAt.getTime() - a.createdAt.getTime()),
    0
  );
  return Math.max(1, Math.round(total / decided.length / 86400000));
}
