import { Skeleton } from "@/components/ui/skeleton";

export default function OpeningsLoading() {
  return (
    <main className="mx-auto max-w-3xl space-y-3 px-4 py-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </main>
  );
}
