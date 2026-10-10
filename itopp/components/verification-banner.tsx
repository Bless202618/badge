import Link from "next/link";

export type BannerStatus = "pending" | "verified" | "rejected";

const copy: Record<BannerStatus, { title: string; body: string; tone: string }> = {
  pending: {
    title: "Under review",
    body: "Your documents were received and are waiting for approval. You cannot post or apply until you are verified.",
    tone: "border-[#D97706] bg-[#FEF3C7]",
  },
  verified: {
    title: "Verified",
    body: "Your account is verified. You can now post openings (companies) or apply (students).",
    tone: "border-[#16A34A] bg-[#DCFCE7]",
  },
  rejected: {
    title: "Needs attention",
    body: "Your submission was rejected. Read the reason below, fix it, and resubmit.",
    tone: "border-[#DC2626] bg-[#FEE2E2]",
  },
};

export function VerificationBanner({
  status,
  reason,
  profileHref,
  profileLabel,
}: {
  status: BannerStatus;
  reason?: string;
  profileHref: string;
  profileLabel: string;
}) {
  const c = copy[status];
  return (
    <div className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${c.tone}`}>
      <b>{c.title}</b>
      <p className="mt-1 text-sm">{c.body}</p>
      {status === "rejected" && reason && (
        <p className="mt-2 rounded-md bg-white/70 p-2 text-sm">
          <b>Reviewer note:</b> {reason}
        </p>
      )}
      {status !== "verified" && (
        <Link
          href={profileHref}
          className="mt-2 inline-block text-sm font-bold text-[#0C6B3C] underline"
        >
          {profileLabel}
        </Link>
      )}
    </div>
  );
}
