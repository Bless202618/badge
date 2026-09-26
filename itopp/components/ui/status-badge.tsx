import { cn } from "@/lib/utils";

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "closed";

type Status = VerificationStatus | ApplicationStatus;

const statusStyles: Record<Status, string> = {
  // Verification — trust states
  pending: "bg-[#FEF3C7] text-[#D97706]",
  verified: "bg-[#DCFCE7] text-[#16A34A]",
  // Application — pipeline states
  applied: "bg-[#DBEAFE] text-[#0B5FFF]",
  shortlisted: "bg-[#DCFCE7] text-[#16A34A]",
  accepted: "bg-[#DCFCE7] text-[#16A34A]",
  // Negative states (shared key: rejected)
  rejected: "bg-[#FEE2E2] text-[#DC2626]",
  suspended: "bg-[#FEE2E2] text-[#DC2626]",
  // Neutral states
  withdrawn: "bg-[#F3F4F6] text-[#6B7280]",
  closed: "bg-[#F3F4F6] text-[#6B7280]",
};

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
  applied: "Applied",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  withdrawn: "Withdrawn",
  closed: "Closed",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
