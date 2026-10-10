import { cn } from "@/lib/utils";

const STEPS = ["Profile", "Review", "Verified"];

export function VerificationSteps({ current }: { current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-1">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1 last:flex-none">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                done && "bg-[#16A34A] text-white",
                active && "bg-[#0C6B3C] text-white",
                !done && !active && "bg-gray-200 text-[#475569]"
              )}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={cn(
                "hidden text-xs font-bold sm:block",
                active ? "text-[#0C6B3C]" : "text-[#475569]"
              )}
            >
              {label}
            </span>
            {n < STEPS.length && <span className="mx-1 h-px flex-1 bg-gray-200" />}
          </li>
        );
      })}
    </ol>
  );
}
