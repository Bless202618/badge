"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { useStore, type Role } from "@/lib/mock-store";

export function SignupForm() {
  const { signup } = useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("student");

  function submit() {
    if (name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    try {
      signup(name, email, role);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed.");
      return;
    }
    toast.success("Account created. Complete your profile for verification.");
    router.push(role === "company" ? "/company/profile" : "/student/profile");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold">Full name</label>
          <Input
            placeholder="Adaeze Okafor"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Email</label>
          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            I am joining as
          </label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student (400-level)</SelectItem>
              <SelectItem value="company">Company (hiring)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={submit}>
          Sign up
        </Button>
        <p className="text-xs text-[#6B7280]">
          Demo only: no password is stored. Real login security arrives with
          Supabase in the next step.
        </p>
      </CardContent>
    </Card>
  );
}
