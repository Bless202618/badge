"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/mock-store";

const DEMOS = [
  { label: "Log in as Admin (you)", email: "admin@itopp.ng" },
  { label: "Log in as Student (Adaeze)", email: "adaeze@student.edu" },
  { label: "Log in as Company (TechCorp)", email: "hello@techcorp.ng" },
];

export function LoginForm() {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");

  function doLogin(target: string) {
    const id = login(target);
    if (!id) {
      toast.error("No account found for that email. Try a demo below.");
      return;
    }
    toast.success("Logged in.");
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={() => doLogin(email)}>Log in</Button>
        </div>
        <div className="border-t pt-4">
          <p className="mb-2 text-sm font-semibold text-[#6B7280]">
            One-click demo accounts (no password needed in this demo):
          </p>
          <div className="flex flex-col gap-2">
            {DEMOS.map((d) => (
              <Button
                key={d.email}
                variant="outline"
                className="justify-start"
                onClick={() => doLogin(d.email)}
              >
                {d.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
