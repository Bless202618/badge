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
import { signupAction } from "@/lib/actions";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "company">("student");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (name.trim().length < 2) {
      toast.error("Enter your full name.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password needs at least 6 characters.");
      return;
    }
    setBusy(true);
    const res = await signupAction({ name, email, password, role });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
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
          <label className="mb-1 block text-sm font-semibold">Password</label>
          <Input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            I am joining as
          </label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as "student" | "company")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student (400-level)</SelectItem>
              <SelectItem value="company">Company (hiring)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={submit} disabled={busy}>
          {busy ? "Creating…" : "Sign up"}
        </Button>
      </CardContent>
    </Card>
  );
}
