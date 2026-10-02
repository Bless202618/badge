"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { rateAction } from "@/lib/actions";

export function RateForm({
  applicationId,
  label,
  existingScore,
}: {
  applicationId: string;
  label: string;
  existingScore: number | null;
}) {
  const [score, setScore] = useState("5");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  if (existingScore !== null) {
    return (
      <p className="text-sm text-[#16A34A]">
        You rated this placement {existingScore}/5.
      </p>
    );
  }

  async function submit() {
    setBusy(true);
    const res = await rateAction({
      applicationId,
      score: Number(score),
      comment,
    });
    setBusy(false);
    if (!res.ok) toast.error(res.error);
    else toast.success("Rating submitted.");
  }

  return (
    <div className="rounded-md bg-gray-50 p-3">
      <b className="text-sm">{label}</b>
      <div className="mt-2 flex gap-2">
        <Select value={score} onValueChange={(v) => setScore(v ?? "5")}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 4, 3, 2, 1].map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s} / 5
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" disabled={busy} onClick={submit}>
          {busy ? "Saving…" : "Submit rating"}
        </Button>
      </div>
      <Textarea
        className="mt-2"
        placeholder="Short comment (optional)…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </div>
  );
}
