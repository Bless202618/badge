"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Toaster />
      <Button
        onClick={() => toast.success("Application submitted — TechCorp Ltd")}
      >
        Show success toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info("New matched opening: Backend Intern")}
      >
        Show info toast
      </Button>
    </div>
  );
}
