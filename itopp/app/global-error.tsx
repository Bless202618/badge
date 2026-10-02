"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-2xl font-extrabold">Something went wrong</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            {error.message || "An unexpected error stopped this page."} Your
            data is safe — try again.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/">Go home</Link>}
            />
          </div>
        </main>
      </body>
    </html>
  );
}
