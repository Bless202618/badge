import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        This opening may have been closed or suspended — or the link is wrong.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button nativeButton={false} render={<Link href="/openings">Browse openings</Link>} />
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/">Go home</Link>}
        />
      </div>
    </main>
  );
}
