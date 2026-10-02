"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, LEVELS, useStore } from "@/lib/mock-store";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  department: z.string().min(1, "Choose your department"),
  level: z.string().min(1, "Choose your level"),
  cgpa: z
    .string()
    .refine(
      (v) => v.trim() !== "" && !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 5,
      "CGPA must be a number between 0 and 5"
    ),
  skills: z.string().min(2, "List at least one skill, e.g. React, Git"),
});

type Values = z.infer<typeof schema>;

export function StudentProfileForm() {
  const { currentUser, currentStudentProfile, saveStudentProfile } = useStore();
  const router = useRouter();
  const existing = currentStudentProfile;
  const [cv, setCv] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing?.name ?? currentUser?.name ?? "",
      department: existing?.department ?? "",
      level: existing?.level ?? "",
      cgpa: existing ? String(existing.cgpa) : "",
      skills: existing?.skills.join(", ") ?? "",
    },
  });

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          Please log in first, then complete your student profile.
        </CardContent>
      </Card>
    );
  }
  if (currentUser.role !== "student") {
    return (
      <Card>
        <CardContent className="pt-6 text-sm">
          This page is for student accounts. Company accounts use the company
          profile page.
        </CardContent>
      </Card>
    );
  }

  function onSubmit(v: Values) {
    const cvName = cv?.name ?? existing?.cvName ?? "";
    const idDocName = idDoc?.name ?? existing?.idDocName ?? "";
    if (!cvName) {
      toast.error("Upload your CV/resume.");
      return;
    }
    if (!idDocName) {
      toast.error("Upload your school ID or admission letter.");
      return;
    }
    saveStudentProfile({
      userId: currentUser!.id,
      name: v.name.trim(),
      department: v.department,
      level: v.level,
      cgpa: Number(v.cgpa),
      skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean),
      cvName,
      idDocName,
    });
    toast.success("Profile submitted. Waiting for verification.");
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student profile + verification documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Full name</label>
            <Input {...register("name")} />
            {errors.name && <Err msg={errors.name.message} />}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Department</label>
              <Select
                value={watch("department")}
                onValueChange={(val) => setValue("department", val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <Err msg={errors.department.message} />}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Level</label>
              <Select
                value={watch("level")}
                onValueChange={(val) => setValue("level", val ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <Err msg={errors.level.message} />}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">CGPA (0–5)</label>
            <Input type="number" step="0.01" min="0" max="5" placeholder="e.g. 4.2" {...register("cgpa")} />
            {errors.cgpa && <Err msg={errors.cgpa.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Skills (comma separated)
            </label>
            <Input placeholder="React, Git, SQL" {...register("skills")} />
            {errors.skills && <Err msg={errors.skills.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              CV / Resume {existing?.cvName && `(current: ${existing.cvName})`}
            </label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              School ID or admission letter{" "}
              {existing?.idDocName && `(current: ${existing.idDocName})`}
            </label>
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setIdDoc(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" className="w-full">
            Submit for verification
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-[#DC2626]">{msg}</p>;
}
