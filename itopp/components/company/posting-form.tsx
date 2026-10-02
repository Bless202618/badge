"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createPostingAction,
  updatePostingAction,
} from "@/lib/actions";
import { DEPARTMENTS } from "@/lib/options";

export interface PostingInitial {
  id: string;
  title: string;
  departments: string[];
  location: string;
  durationMonths: number;
  skillsRequired: string[];
  customQuestions: string[];
}

export function PostingForm({ initial }: { initial?: PostingInitial }) {
  const router = useRouter();
  const [mode, setMode] = useState<"custom" | "quick">(initial?.customQuestions.length ? "custom" : "quick");
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [departments, setDepartments] = useState<string[]>(
    initial?.departments ?? []
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [duration, setDuration] = useState(
    initial ? String(initial.durationMonths) : "6"
  );
  const [skills, setSkills] = useState(
    (initial?.skillsRequired ?? []).join(", ")
  );
  const [questions, setQuestions] = useState<string[]>(
    initial?.customQuestions ?? []
  );
  const [newQ, setNewQ] = useState("");

  function toggleDept(d: string) {
    setDepartments((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  async function submit() {
    if (title.trim().length < 4) {
      toast.error("Give the opening a clear title.");
      return;
    }
    if (departments.length === 0) {
      toast.error("Pick at least one department.");
      return;
    }
    if (location.trim().length < 2) {
      toast.error("Enter the work location.");
      return;
    }
    const months = Number(duration);
    if (!Number.isInteger(months) || months < 1 || months > 12) {
      toast.error("Duration must be 1–12 months.");
      return;
    }
    const payload = {
      title: title.trim(),
      departments,
      location: location.trim(),
      durationMonths: mode === "quick" ? 6 : months,
      skillsRequired:
        mode === "quick"
          ? []
          : skills.split(",").map((s) => s.trim()).filter(Boolean),
      customQuestions: mode === "quick" ? [] : questions,
      isQuickPost: mode === "quick",
    };
    setBusy(true);
    const res = initial
      ? await updatePostingAction({ ...payload, id: initial.id })
      : await createPostingAction(payload);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(initial ? "Opening updated." : "Opening published.");
    router.push("/company/postings");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initial ? "Edit opening" : "New opening"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!initial && (
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "custom" | "quick")}
          >
            <TabsList>
              <TabsTrigger value="quick">Quick post (1 screen)</TabsTrigger>
              <TabsTrigger value="custom">Custom (full criteria)</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold">Title</label>
          <Input
            placeholder="e.g. Frontend Intern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Departments (pick at least one)
          </label>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDept(d)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  departments.includes(d)
                    ? "border-[#0B5FFF] bg-[#DBEAFE] text-[#0B5FFF]"
                    : "border-gray-300 bg-white text-[#6B7280]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Location</label>
            <Input
              placeholder="e.g. Lagos (Hybrid)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          {mode === "custom" && (
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Duration (months, 1–12)
              </label>
              <Input
                type="number"
                min="1"
                max="12"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}
        </div>

        {mode === "custom" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Required skills (comma separated)
              </label>
              <Input
                placeholder="e.g. React, Git, Figma"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Your screening questions (applicants must answer)
              </label>
              {questions.length > 0 && (
                <ul className="mb-2 space-y-1">
                  {questions.map((q, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm"
                    >
                      <span>
                        {i + 1}. {q}
                      </span>
                      <button
                        type="button"
                        className="font-bold text-[#DC2626]"
                        onClick={() =>
                          setQuestions(questions.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Link to something you built"
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newQ.trim().length < 3 || questions.length >= 10) return;
                    setQuestions([...questions, newQ.trim()]);
                    setNewQ("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </>
        )}

        {mode === "quick" && (
          <p className="rounded-md bg-[#EFF6FF] p-3 text-sm text-[#0B5FFF]">
            Quick post: 6-month duration, no screening questions. Students see
            it like any other opening.
          </p>
        )}

        <Button className="w-full" onClick={submit} disabled={busy}>
          {busy
            ? "Saving…"
            : initial
              ? "Save changes"
              : mode === "quick"
                ? "Publish quick post"
                : "Publish opening"}
        </Button>
      </CardContent>
    </Card>
  );
}
