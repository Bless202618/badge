import { VerificationQueue } from "@/components/admin/verification-queue";

export default function AdminQueuePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <h1 className="text-2xl font-extrabold">Verification queue</h1>
      <p className="text-sm text-[#6B7280]">
        You are the sole verifier. Approve real accounts, reject with a clear
        reason so they can fix and resubmit.
      </p>
      <VerificationQueue />
    </main>
  );
}
