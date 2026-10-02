"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { applyAction } from "@/lib/actions";

export function ApplyForm({
  postingId,
  questions,
}: {
  postingId: string;
  questions: string[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
  const [busy, setBusy] = useState(false);

  function setAnswer(i: number, v: string) {
    setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)));
  }

  async function submit() {
    for (let i = 0; i < questions.length; i++) {
      if (answers[i].trim().length < 2) {
        toast.error(`Answer question ${i + 1} before submitting.`);
        return;
      }
    }
    setBusy(true);
    const res = await applyAction({ postingId, answers });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Application sent. Track it under My applications.");
    router.push("/applications");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this opening</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No screening questions — one tap and your profile + CV go to the
            company.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={i}>
              <label className="mb-1 block text-sm font-semibold">
                {i + 1}. {q}
              </label>
              <Textarea
                value={answers[i]}
                onChange={(e) => setAnswer(i, e.target.value)}
                placeholder="Your answer…"
              />
            </div>
          ))
        )}
        <Button className="w-full" onClick={submit} disabled={busy}>
          {busy ? "Sending…" : "Submit application"}
        </Button>
        <p className="text-xs text-[#6B7280]">
          Max 5 active applications at a time. Withdrawing frees a slot.
        </p>
      </CardContent>
    </Card>
  );
}
